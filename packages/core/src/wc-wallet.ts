import { Algo, SimpleAccount, Wallet, WcEventTypes, WcProviderEventType } from './types/wallet';
import { BaseWallet } from "./wallets/base-wallet";
import { WalletAccount, SignOptions, DirectSignDoc, BroadcastMode } from "./types";
import { SignClient } from '@walletconnect/sign-client';
import { EngineTypes, PairingTypes, SessionTypes, SignClientTypes } from '@walletconnect/types';
import { Buffer } from 'buffer'
import {
  AminoGeneralOfflineSigner,
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
    return this.provider.client.pairing.getAll({ active: true })
  }

  setPairingToConnect(pairing: PairingTypes.Struct) {
    this.pairingToConnect = pairing
  }

  setOnPairingUriCreatedCallback(callback: (uri: string) => void) {
    this.onPairingUriCreated = callback
  }

  async connect(chainIds: string | string[]) {


    // const chainIdsWithNS = Array.isArray(chainIds) ? chainIds.map((chainId) => `cosmos:${chainId}`) : [`cosmos:${chainIds}`]

    const _chainIds = Array.isArray(chainIds) ? chainIds : [chainIds]
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

    console.log({ cosmosChainNS, eip155ChainNS })

    const connectParam: ConnectParams = {
      pairingTopic: this.pairingToConnect?.topic,
      namespaces: {}
    }

    if (cosmosChainNS.length) {
      connectParam.namespaces.cosmos = {
        methods: [
          'cosmos_getAccounts',
          'cosmos_signAmino',
          'cosmos_signDirect',
        ],
        chains: cosmosChainNS,
        events: ['chainChanged', 'accountsChanged']
      }
    }

    if (eip155ChainNS.length) {
      connectParam.namespaces.eip155 = {
        methods: [
          'eth_sign',
          'eth_sendTransaction',
          'eth_signTypedData_v4',
          'eth_signTypedData',
          'eth_signTransaction',
          // 'eth_private_key'
          // 'eth_getBalance',
          // 'eth_requestAccounts'
        ],
        chains: eip155ChainNS,
        events: ['chainChanged', 'accountsChanged']
      }
    }

    console.log(connectParam)

    let session

    if (this.session && this.pairingToConnect && this.session.peer.metadata.name !== this.pairingToConnect.peerMetadata.name) {
      // if session exist and pairingToConnect exist same time
      // check if the session is the same as pairingToConnect
      // if not, remove the session and connect to pairingToConnect
      await this.removeSession()
    }

    try {
      session = this.getLatestSession()
      if (session) {
        this.session = session
      } else {

        this.provider.on('display_uri', (uri: string) => {
          this.pairingUri = uri
          this.onPairingUriCreated && this.onPairingUriCreated(uri)
        })


        await this.provider.connect(connectParam)



        this.session = this.provider.session
        this.pairingUri = null
        this.onPairingUriCreated && this.onPairingUriCreated(null)
      }

    } catch (error) {
      throw error
    }
  }

  async disconnect(): Promise<void> {
    // await this.removePairing()
    await this.removeSession()
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

  override async getSimpleAccount(chainId: string): Promise<SimpleAccount> {
    const accounts: SimpleAccount[] = []

    const namespaces = this.session.namespaces

    Object.entries(namespaces).forEach(([namespace, session]: [string, SessionTypes.BaseNamespace]) => {
      session.accounts.forEach((account: string) => {
        const [namespace, chainId, address] = account.split(':')
        accounts.push({
          namespace,
          chainId,
          address,
        })
      })
    })

    return Promise.resolve(accounts.find((account) => account.chainId === chainId))
  }

  getAccount(chainId: Chain['chainId']): Promise<WalletAccount> {
    const chain = this.getChainById(chainId)

    if (chain.chainType === 'cosmos') {
      return this.getCosmosAccount(chainId)
    } else {
      return this.getEthAddress(chainId)
    }

  }

  async getCosmosAccount(chainId: string): Promise<WalletAccount> {
    try {
      if (!this.signClient || !this.session?.topic) {
        return;
      }
      const accounts = await this.provider.request({
        topic: this.session?.topic,
        request: {
          method: 'cosmos_getAccounts',
          params: {}
        },
        chainId: `cosmos:${chainId}`
      }) as any[]

      const { address, algo, pubkey } = accounts[0]

      return {
        address,
        algo: algo as Algo,
        pubkey: new Uint8Array(Buffer.from(pubkey, 'base64')),
      }
    } catch (error) {
      this.errorMessage = (error as any).message
      throw error
    }
  }

  async getEthAddress(chainId: string) {


    // const accounts = await this.provider.request({ method: 'eth_requestAccounts', params: [{ chainId }] })
    // console.log({ chainId, accounts })
    // return {
    //   address: accounts[0],
    //   pubkey: new Uint8Array(),
    //   algo: 'eth_secp256k1',
    //   isNanoLedger: false,
    //   isSmartContract: false,
    //   username: 'ethereum'
    // }
    const accounts = this.session.namespaces.eip155.accounts.find((account) => account.startsWith(`eip155:${chainId}`))
    return {
      address: accounts.split(':')[2],
      algo: 'secp256k1',
      pubkey: new Uint8Array(),
    }
  }

  async getBalance(chainId: string) {
    try {
      const account = await this.getAccount(chainId)
      console.log({ address: account.address, chainId })
      // const result = await this.signClient.request({
      //   topic: this.session.topic,
      //   chainId: `eip155:${chainId}`,
      //   request: {
      //     method: 'eth_getBalance',
      //     params: [account.address, 'latest']
      //   }
      // })
      const result = await this.provider.request({
        method: 'eth_getBalance',
        params: [account.address, 'latest'],
      }, `eip155:${chainId}`)

      console.log(result)
      return result
    } catch (error) {
      console.log(error)
      throw error
    }

  }

  async sendTransaction(transaction: any) {
    const result = await this.provider.request({
      method: 'eth_sendTransaction',
      params: [transaction],
    })
    return result
  }

  async getEthPrivateKey() {
    const result = await this.provider.request({
      method: 'eth_private_key',
    })
    console.log(result)
    return result
  }

  async getOfflineSigner(chainId: Chain['chainId']): Promise<IGeneralOfflineSigner> {
    return this.getOfflineSignerAmino(chainId)
  }

  getOfflineSignerAmino(chainId: string): IGeneralOfflineSigner {
    return new AminoGeneralOfflineSigner({
      getAccounts: async () => [await this.getAccount(chainId)],
      signAmino: (signerAddress: string, signDoc: StdSignDoc) =>
        this.signAmino(chainId, signerAddress, signDoc),
    }) as IGeneralOfflineSigner
  }

  getOfflineSignerDirect(chainId: string): OfflineDirectSigner {
    return {
      getAccounts: async () => [await this.getAccount(chainId)],
      signDirect: (signerAddress: string, signDoc: DirectSignDoc) =>
        this.signDirect(chainId, signerAddress, signDoc),
    }
  }

  getOfflineSigner(chainId: string): OfflineSigner {
    return {
      getAccounts: async () => [await this.getAccount(chainId)],
      signAmino: (signerAddress: string, signDoc: StdSignDoc) =>
        this.signAmino(chainId, signerAddress, signDoc),
      signDirect: (signerAddress: string, signDoc: DirectSignDoc) =>
        this.signDirect(chainId, signerAddress, signDoc),
    }
  }

  override async signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<AminoSignResponse> {
    try {
      const result = await this.signClient.request({
        topic: this.session.topic,
        chainId: `cosmos:${chainId}`,
        request: {
          method: 'cosmos_signAmino',
          params: {
            signerAddress: signer,
            signDoc,
          },
        },
      });
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

    return this.signClient.request({
      topic: this.session.topic,
      chainId: `cosmos:${chainId}`,
      request: {
        method: 'cosmos_signDirect',
        params: signDocValue,
      },
    });
  }

  sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array> {
    throw new Error("Method not implemented.");
  }

  sign(chainId: string, message: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  addSuggestChain(chain: Chain, assetLists: AssetList[]): Promise<void> {
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


