import { StdSignDoc } from '@interchainjs/types';
import { BaseWallet } from "./base-wallet";
import { WalletAccount, SimpleAccount, SignOptions, DirectSignDoc, BroadcastMode, Wallet } from "./types";
import Transport from "@ledgerhq/hw-transport";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import { chains } from "@chain-registry/v2";
import Cosmos from "@ledgerhq/hw-app-cosmos";
import { ChainInfo } from '@keplr-wallet/types'
import {
  OfflineAminoSigner,
  OfflineDirectSigner,
  DirectSignResponse,
  AminoSignResponse,
  StdSignature
} from '@interchainjs/cosmos/types/wallet';
import { LedgerConnectIcon } from './constant';

export class LedgerWallet extends BaseWallet {

  cosmosPath: string;
  transport: Transport;
  cosmos: Cosmos;
  chainIdToBech32Prefix: Record<string, string> = {}
  hidSupported: boolean = false

  constructor(info?: Wallet) {

    const defaultWalletConnectInfo: Wallet = {
      name: 'LedgerWallet',
      prettyName: 'Ledger Connect',
      mode: 'ledger',
      logo: LedgerConnectIcon
    }

    super({ ...defaultWalletConnectInfo, ...info })
  }

  async init(meta?: unknown): Promise<void> {

    this.cosmosPath = '44\'/118\'/0\'/0/0';

    chains.forEach(c => {
      this.chainIdToBech32Prefix[c.chainId] = c.bech32Prefix;
    })

    try {
      this.hidSupported = await TransportWebHID.isSupported();

    } catch (error) {
      this.hidSupported = false
    }
  }

  async connect(chainId: string | string[]): Promise<void> {
    try {
      this.transport = await TransportWebHID.create()
      this.cosmos = new Cosmos(this.transport)
    } catch (error) {
      this.errorMessage = (error as any).message;
    }
  }

  async disconnect(chainId: string | string[]): Promise<void> {
    if (this.transport) {
      await this.transport.close();
    }
  }

  async getAccount(chainId: string): Promise<WalletAccount> {
    const prefix = this.chainIdToBech32Prefix[chainId];
    if (!prefix) {
      throw new Error(`Unknown chainId: ${chainId}`);
    }
    if (!this.transport) {
      throw new Error("Ledger transport not initialized");
    }

    try {
      const { publicKey, address } = await this.cosmos.getAddress(this.cosmosPath, prefix);
      return {
        username: this.cosmosPath || '',
        address,
        algo: 'secp256k1',
        pubkey: new TextEncoder().encode(publicKey),
        isNanoLedger: true,
      };
    } catch (error) {
      if ((error as any).message.includes("Ledger Device is busy")) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const account = this.getAccount(chainId)
            resolve(account)
          }, 500)
        })
      }
      this.errorMessage = (error as any).message;
    }
  }

  getAccounts(chainIds: string[]): Promise<WalletAccount[]> {
    throw new Error("Method not implemented.");
  }

  async getSimpleAccount(chainId: string): Promise<SimpleAccount> {
    const { address, username } = await this.getAccount(chainId);
    return {
      namespace: 'cosmos',
      chainId,
      address,
      username,
    };
  }

  getOfflineSignerAmino(chainId: string): OfflineAminoSigner {
    return {
      getAccounts: async () => [await this.getAccount(chainId)],
      signAmino: async (signer, signDoc) => this.signAmino(chainId, signer, signDoc, {}),
    }
  }

  getOfflineSignerDirect(chainId: string): OfflineDirectSigner {
    throw new Error("Method not implemented.");
  }

  async signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<AminoSignResponse> {
    const response = await this.cosmos.sign(this.cosmosPath, JSON.stringify(signDoc));
    if (response.return_code !== 0x9000) {
      throw new Error("Failed to sign transaction on Ledger device");
    }

    const account = await this.getAccount(chainId);

    return {
      signed: signDoc,
      signature: {
        pub_key: {
          type: "tendermint/PubKeySecp256k1",
          value: Buffer.from(account.pubkey).toString("base64"),
        },
        signature: Buffer.from(response.signature).toString("base64"),
      },
    };
  }

  signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature> {
    throw new Error("Method not implemented.");
  }

  verifyArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  signDirect(chainId: string, signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions): Promise<DirectSignResponse> {
    throw new Error("Method not implemented.");
  }

  sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array> {
    throw new Error("Method not implemented.");
  }

  addSuggestChain(chainInfo: ChainInfo): Promise<void> {
    throw new Error("Method not implemented.");
  }

  bindingEvent(): void {
    throw new Error("Method not implemented.");
  }

  unbindingEvent(): void {
    throw new Error("Method not implemented.");
  }

}