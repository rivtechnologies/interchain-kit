import { Algo, SimpleAccount, Wallet, WcEventTypes, WcProviderEventType } from './types/wallet';
import { BaseWallet } from "./wallets/base-wallet";
import { WalletAccount, SignOptions, DirectSignDoc, BroadcastMode } from "./types";
import { SignClient } from '@walletconnect/sign-client';
import { EngineTypes, PairingTypes, SessionTypes, SignClientTypes } from '@walletconnect/types';
import { Buffer } from 'buffer'
import {
  AminoGenericOfflineSigner,
  DirectGenericOfflineSigner,
  OfflineAminoSigner,
  OfflineDirectSigner,
  OfflineSigner,
} from '@interchainjs/cosmos/types/wallet';
import { AminoSignResponse, StdSignature, DirectSignResponse } from '@interchainjs/cosmos/types/wallet';
import { IGeneralOfflineSigner, StdSignDoc } from '@interchainjs/types'
import { WalletConnectIcon } from './constant';
import { Chain, AssetList } from '@chain-registry/v2-types';
import UniversalProvider, { ConnectParams } from '@walletconnect/universal-provider';


export class WCWallet extends BaseWallet {

  pairingUri: string;

  session: SessionTypes.Struct;

  // signClient: InstanceType<typeof SignClient>;

  provider: UniversalProvider

  pairingToConnect: PairingTypes.Struct = null

  sessionToConnect: SessionTypes.Struct = null

  walletConnectOption: SignClientTypes.Options

  onPairingUriCreated: (uri: string) => void

  constructor(option?: Wallet, walletConnectOption?: SignClientTypes.Options) {
    const defaultWalletConnectOption: Wallet = {
      name: 'WalletConnect',
      prettyName: 'Wallet Connect',
      mode: 'wallet-connect',
      logo: WalletConnectIcon
    }

    super({ ...defaultWalletConnectOption, ...option })

    this.walletConnectOption = walletConnectOption
  }

  override async init(): Promise<void> {
    this.events.removeAllListeners()

    const defaultOption = {
      projectId: '15a12f05b38b78014b2bb06d77eecdc3',
      // optional parameters
      relayUrl: 'wss://relay.walletconnect.org',
      metadata: {
        name: 'Example Dapp',
        description: 'Example Dapp',
        url: '#',
        icons: ['https://walletconnect.com/walletconnect-logo.png']
      }
    }

    // this.signClient = await SignClient.init({ ...defaultOption, ...this.walletConnectOption })
    this.provider = await UniversalProvider.init({ ...defaultOption, ...this.walletConnectOption })
    this.bindingEvent()
  }

  async removePairing() {
    const pairings = this.provider.client.pairing.getAll()

    for (const pairing of pairings) {
      await this.provider.client.pairing.delete(pairing.topic, {
        code: 7001,
        message: 'disconnect'
      })
    }
  }

  async removeSession() {
    const sessions = this.provider.client.session.getAll()
    for (const session of sessions) {
      await this.provider.client.session.delete(session.topic, {
        code: 6000,
        message: 'user disconnect.'
      })
    }
  }

  getLatestSession(): SessionTypes.Struct | undefined {
    return this.provider.client.session.getAll().pop()
  }

  getLatestPairing(): PairingTypes.Struct | undefined {
    return this.provider.client.pairing.getAll({ active: true }).pop()
  }

  getActivePairing(): PairingTypes.Struct[] {
    if (!this.provider.client) {
      return []
    }
    const p = this.provider.client.pairing.getAll({ active: true })
    console.log(p)
    return p
  }

  setPairingToConnect(pairing: PairingTypes.Struct) {
    this.pairingToConnect = pairing
  }

  setOnPairingUriCreatedCallback(callback: (uri: string) => void) {
    this.onPairingUriCreated = callback
  }

  async connect(chainIds: string) {

    // const chainIdsWithNS = Array.isArray(chainIds) ? chainIds.map((chainId) => `cosmos:${chainId}`) : [`cosmos:${chainIds}`]

    const _chainIds = Array.from(this.chainMap).map(([chainId, chain]) => chainId)
    const cosmosChainNS: string[] = []
    const eip155ChainNS: string[] = []

    _chainIds.forEach((chainId) => {
      const chain = this.getChainById(chainId)
      if (chain.chainType === 'cosmos') {
        cosmosChainNS.push(`cosmos:${chainId}`)
      }
      if (chain.chainType === 'eip155') {
        eip155ChainNS.push(`eip155:${chainId}`)
      }
    })

    const connectParam: ConnectParams = {
      pairingTopic: this.pairingToConnect?.topic,
      namespaces: {},
    }

    if (cosmosChainNS.length) {
      connectParam.namespaces.cosmos = {
        methods: [
          'cosmos_signAmino',
          'cosmos_signDirect',
          'cosmos_getAccounts',
        ],
        chains: cosmosChainNS,
        events: ["accountsChanged", "chainChanged"],
      }
    }

    if (eip155ChainNS.length) {
      connectParam.namespaces.eip155 = {
        methods: [
          'eth_sendTransaction',
          'eth_signTransaction',
          'eth_sign',
          'personal_sign',
          'eth_signTypedData',
          'trust_sendTransaction',
        ],
        chains: eip155ChainNS,
        events: []
      }
    }

    try {
      console.log('start connect', this.sessionToConnect)
      this.provider.on("disconnect", (error) => {
        console.error("断开连接:", error);
      });

      this.provider.on("session_delete", (event) => {
        console.log("会话被删除，清理状态", event);
      });

      this.provider.on("session_event", (event) => {
        console.log("收到 Session 事件:", event);
      });

      this.provider.on('display_uri', (uri: string) => {
        this.pairingUri = uri
        this.onPairingUriCreated && this.onPairingUriCreated(uri)
      })
      console.log(connectParam)
      await this.provider.connect(connectParam)

      this.pairingUri = null

      this.onPairingUriCreated && this.onPairingUriCreated(null)
    } catch (error) {
      console.log('wc connect error', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    await this.provider.client.session.delete(this.provider?.session?.topic, { code: 6000, message: 'user disconnect!!' })
    // await this.provider.disconnect()
    // this.provider.client.pairing.delete(this.pairingToConnect.topic, { code: 6000, message: 'user disconnect!!' })
    // await this.provider.client.disconnect({ topic: this.sessionToConnect.topic, reason: { code: 6000, message: 'user disconnect!!' } })
    // await this.provider.client.pairing.delete(this.pairingToConnect.topic, { code: 6000, message: 'user disconnect!!' })
    // await this.removeSession()
    // this.sessionToConnect = null
  }

  async getAccounts(): Promise<WalletAccount[]> {
    const accounts: WalletAccount[] = []

    const namespaces = this.session.namespaces

    Object.entries(namespaces).forEach(([namespace, session]: [string, SessionTypes.BaseNamespace]) => {
      session.accounts.forEach((account: string) => {
        const [namespace, chainId, address] = account.split(':')
        accounts.push({
          address: address,
          algo: 'secp256k1',
          pubkey: null,
          username: '',
          isNanoLedger: null,
          isSmartContract: null
        })
      })
    })

    return accounts
  }

  async getAccount(chainId: Chain['chainId']): Promise<WalletAccount> {
    const chain = this.getChainById(chainId)

    let accounts: string[] = []

    if (this.provider.session) {
      accounts = this.provider.session.namespaces[chain.chainType].accounts
    }

    return {
      address: accounts[0]?.split(':').pop(),
      algo: 'secp256k1',
      pubkey: null,
      username: '',
      isNanoLedger: null,
      isSmartContract: null
    }
  }

  async getCosmosAccount(chainId: string): Promise<WalletAccount> {

    try {

      const accounts = await this.provider.request({
        method: 'cosmos_getAccounts',
        params: []
      }, `cosmos:${chainId}`) as any[]

      const { address, algo, pubkey } = accounts[0]
      return {
        address,
        algo: algo as Algo,
        pubkey: pubkey,
      }
    } catch (error) {
      this.errorMessage = (error as any).message
      console.log('get cosmos account error', error)
      throw error
    }
  }

  async getOfflineSignerAmino(chainId: string): IGeneralOfflineSigner {
    return new AminoGenericOfflineSigner({
      getAccounts: async () => [await this.getAccount(chainId)],
      signAmino: (signerAddress: string, signDoc: StdSignDoc) =>
        this.signAmino(chainId, signerAddress, signDoc),
    })
  }

  async getOfflineSignerDirect(chainId: string): IGeneralOfflineSigner {
    return new DirectGenericOfflineSigner({
      getAccounts: async () => [await this.getAccount(chainId)],
      signDirect: (signerAddress: string, signDoc: DirectSignDoc) =>
        this.signDirect(chainId, signerAddress, signDoc),
    })
  }

  getOfflineSigner(chainId: string): IGeneralOfflineSigner {
    return this.getOfflineSignerAmino(chainId)
  }

  async signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<AminoSignResponse> {
    try {
      // const result = await this.signClient.request({
      //   topic: this.session.topic,
      //   chainId: `cosmos:${chainId}`,
      //   request: {
      //     method: 'cosmos_signAmino',
      //     params: {
      //       signerAddress: signer,
      //       signDoc,
      //     },
      //   },
      // });
      const result = await this.provider.request({
        method: 'cosmos_signAmino',
        params: {
          signerAddress: signer,
          signDoc,
        },
      }, `cosmos:${chainId}`)

      return result as AminoSignResponse
    } catch (error) {
      console.log(error)
    }
  }

  signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature> {
    throw new Error("Method not implemented.");
  }

  verifyArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  signDirect(chainId: string, signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions): Promise<DirectSignResponse> {
    const signDocValue = {
      signerAddress: signer,
      signDoc: {
        chainId: signDoc.chainId,
        bodyBytes: Buffer.from(signDoc.bodyBytes).toString('base64'),
        authInfoBytes: Buffer.from(signDoc.authInfoBytes).toString(
          'base64'
        ),
        accountNumber: signDoc.accountNumber.toString(),
      },
    };

    // return this.signClient.request({
    //   topic: this.session.topic,
    //   chainId: `cosmos:${chainId}`,
    //   request: {
    //     method: 'cosmos_signDirect',
    //     params: signDocValue,
    //   },
    // });
    return this.provider.request({
      method: 'cosmos_signDirect',
      params: signDocValue,
    }, `cosmos:${chainId}`) as Promise<DirectSignResponse>
  }

  sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array> {
    throw new Error("Method not implemented.");
  }

  sign(chainId: string, message: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  addSuggestChain(chainId: Chain['chainId']): Promise<void> {
    throw new Error("Method not implemented.");
  }

  bindingEvent(): void {
    this.events.removeAllListeners()
    const events = [...Object.keys(WcEventTypes), ...Object.keys(WcProviderEventType)]
    // for (const event of events) {
    //   this.signClient.core.on(event, (data: never) => {
    //     this.events.emit(event, data)

    //     if (event === 'accountsChanged') {
    //       this.events.emit('keystoreChange')
    //     }

    //   })
    // }

    // this.signClient.events.on('session_event', (data: SignClientTypes.EventArguments['session_event']) => {
    //   console.log('session_event_trigger', data)
    //   this.events.emit('accountChanged', data)
    // })

    for (const event of events) {
      // console.log(event)
      this.signClient.on(event as any, (data: any) => {
        console.log(event, data)
      })
    }

  }

  unbindingEvent(): void {
    this.signClient.events.removeAllListeners('session_event')
    this.events.removeAllListeners()
  }

  async ping() {
    if (!this.signClient) {
      return
    }
    try {
      await this.signClient.ping({
        topic: this.session.topic
      })
      return 'success'
    } catch (error) {
      console.log(error)
      return 'failed'
    }
  }

  getProvider() {
    return this.provider
  }
}


