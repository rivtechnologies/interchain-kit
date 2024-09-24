import { AccountData, Algo, SimpleAccount, Wallet, WcEventTypes, WcProviderEventType } from './types/wallet';
import { BaseWallet } from "./base-wallet";
import { WalletAccount, SignOptions, DirectSignDoc, BroadcastMode } from "./types";
import { SignClient } from '@walletconnect/sign-client';
import { ISignClient, PairingTypes, SessionTypes, SignClientTypes } from '@walletconnect/types';
import { Buffer } from 'buffer'
import { ChainInfo } from '@keplr-wallet/types'
import {
  OfflineAminoSigner,
  OfflineDirectSigner,
} from '@interchainjs/cosmos/types/wallet';
import { AminoSignResponse, StdSignature, DirectSignResponse } from '@interchainjs/cosmos/types/wallet';
import { StdSignDoc } from '@interchainjs/types'
import { WalletConnectIcon } from './constant';

export class WCWallet extends BaseWallet {

  pairingUri: string;

  session: SessionTypes.Struct;

  signClient: InstanceType<typeof SignClient>;

  constructor(option?: Wallet) {
    const defaultWalletConnectOption: Wallet = {
      name: 'WalletConnect',
      prettyName: 'Wallet Connect',
      mode: 'wallet-connect',
      logo: WalletConnectIcon
    }

    super({ ...defaultWalletConnectOption, ...option })
  }

  override async init(): Promise<void> {
    this.events.removeAllListeners()
    this.signClient = await SignClient.init({
      projectId: '15a12f05b38b78014b2bb06d77eecdc3',
      // optional parameters
      relayUrl: 'wss://relay.walletconnect.org',
      metadata: {
        name: 'Example Dapp',
        description: 'Example Dapp',
        url: '#',
        icons: ['https://walletconnect.com/walletconnect-logo.png']
      }
    })
    this.bindingEvent()
  }

  getAllPairings(): PairingTypes.Struct[] {
    return this.signClient.core.pairing.getPairings()
  }

  removePairing() {
    const pairings = this.getAllPairings()
    for (const pairing of pairings) {
      this.signClient.core.pairing.disconnect({ topic: pairing.topic })
      // this.signClient.core.pairing.pairings.delete(pairing.topic, {
      //   code: 7001,
      //   message: 'disconnect'
      // })
    }
  }

  async connect(chainIds: string | string[]) {
    this.removePairing()

    const chainIdsWithNS = Array.isArray(chainIds) ? chainIds.map((chainId) => `cosmos:${chainId}`) : [`cosmos:${chainIds}`]

    try {
      const { uri, approval } = await this.signClient.connect({
        requiredNamespaces: {
          cosmos: {
            methods: [
              'cosmos_getAccounts',
              'cosmos_signAmino',
              'cosmos_signDirect',
            ],
            chains: chainIdsWithNS,
            events: ['chainChanged', 'accountsChanged']
          },
        }

      })

      this.pairingUri = uri

      const session = await approval()
      this.session = session

      this.pairingUri = null

    } catch (error) {
      throw error
    }
  }

  async disconnect(): Promise<void> {
    this.removePairing()
    this.session = null
    this.pairingUri = null
  }

  getAccounts(): Promise<WalletAccount[]> {
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

    return Promise.resolve(accounts)
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

  override async getAccount(chainId: string): Promise<WalletAccount> {
    if (!this.signClient || !this.session?.topic) {
      return;
    }
    const accounts = await this.signClient.request({
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
  }

  getOfflineSignerAmino(chainId: string): OfflineAminoSigner {
    return {
      getAccounts: async () => [await this.getAccount(chainId)],
      signAmino: (signerAddress: string, signDoc: StdSignDoc) =>
        this.signAmino(chainId, signerAddress, signDoc),
    }
  }

  getOfflineSignerDirect(chainId: string): OfflineDirectSigner {
    return {
      getAccounts: async () => [await this.getAccount(chainId)],
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

  addSuggestChain(chainInfo: ChainInfo): Promise<void> {
    throw new Error('Method not implemented.');
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

    this.signClient.events.on('session_event', (data: SignClientTypes.EventArguments['session_event']) => {
      console.log('session_event_trigger', data)
      this.events.emit('keystoreChange')
    })
  }

  unbindingEvent(): void {
    this.signClient.events.removeAllListeners('session_event')
    this.events.removeAllListeners()
  }
}
