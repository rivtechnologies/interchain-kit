import { SimpleAccount, Wallet } from './types/wallet';
import { BaseWallet } from "./base-wallet";
import { OfflineAminoSigner, StdSignDoc, AminoSignResponse, StdSignature } from "@cosmjs/amino";
import { OfflineDirectSigner, DirectSignResponse, Algo } from "@cosmjs/proto-signing";
import { WalletAccount, SignOptions, DirectSignDoc, BroadcastMode } from "./types";
import { SignClient } from '@walletconnect/sign-client';
import { ISignClient, SessionTypes } from '@walletconnect/types';


export class MobileWallet extends BaseWallet {

  pairingUri: string;

  session: SessionTypes.Struct;

  signClient: ISignClient

  constructor({ option }: { option: Wallet | undefined }) {
    super({ option })
  }

  override async init(): Promise<void> {
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
  }

  async connect(chainIds: string | string[], onApprove: () => {}, onGenerateParingUri: (uri: string) => {}) {

    const chainIdsWithNS = Array.isArray(chainIds) ? chainIds.map((chainId) => `cosmos:${chainId}`) : [`cosmos:${chainIds}`]
    try {
      const { uri, approval } = await this.signClient.connect({
        // Optionally: pass a known prior pairing (e.g. from `signClient.core.pairing.getPairings()`) to skip the `uri` step.
        // pairingTopic: pairing?.topic,
        // Provide the namespaces and chains (e.g. `eip155` for EVM-based chains) we want to use in this session.
        requiredNamespaces: {
          cosmos: {
            methods: [
              'cosmos_getAccounts',
              'cosmos_signAmino',
              'cosmos_signDirect',
            ],
            chains: chainIdsWithNS,
            events: ['chainChanged', 'accountsChanged']
          }
        }
      })

      this.pairingUri = uri

      onGenerateParingUri(uri)

      const session = await approval()
      this.session = session

      onApprove()

    } catch (error) {
      console.log(error)
    }
  }

  enable(chainId: string | string[]): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async disable(): Promise<void> {
    await this.client.disconnect()
    await this.client.cleanupPendingPairings()
  }

  getAccounts(): SimpleAccount[] {
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

    return accounts
  }

  override async getSimpleAccount(chainId: string): Promise<any> {
    const accounts = this.getAccounts()
    const account = accounts.find((account) => account.chainId === chainId)
    return account
  }

  override async getAccount(chainId: string): Promise<WalletAccount> {
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
    } as OfflineAminoSigner;
  }

  getOfflineSignerDirect(chainId: string): OfflineDirectSigner {
    return {
      getAccounts: async () => [await this.getAccount(chainId)],
      signDirect: (signerAddress: string, signDoc: DirectSignDoc) =>
        this.signDirect(chainId, signerAddress, signDoc),
    } as OfflineDirectSigner;
  }

  override async signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<AminoSignResponse> {
    return this.signClient.request({
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
  }

  signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature> {
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
}
