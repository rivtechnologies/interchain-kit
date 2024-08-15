import { OfflineAminoSigner, StdSignDoc, AminoSignResponse, StdSignature, Algo } from "@cosmjs/amino";
import { OfflineDirectSigner, DirectSignResponse } from "@cosmjs/proto-signing";
import { BaseWallet } from "./base-wallet";
import { WalletAccount, SimpleAccount, SignOptions, DirectSignDoc, BroadcastMode } from "./types";
import Transport from "@ledgerhq/hw-transport";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import { chains } from "@chain-registry/v2";
import Cosmos from "@ledgerhq/hw-app-cosmos";
import { ChainInfo } from '@keplr-wallet/types'

export class LedgerWallet extends BaseWallet {

  cosmosPath: string;
  transport: Transport;
  cosmos: Cosmos;
  chainIdToBech32Prefix: Record<string, string> = {}
  hidSupported: boolean = false

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
    const transport = await TransportWebHID.create();
    this.cosmos = new Cosmos(transport)
    this.transport = transport;
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
      const { address, publicKey } = await this.cosmos.getAddress(this.cosmosPath, prefix)
      return {
        username: this.cosmosPath || '',
        address,
        algo: 'secp256k1' as Algo,
        pubkey: new TextEncoder().encode(publicKey),
        isNanoLedger: true,
      };
    } catch (error) {
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
    throw new Error("Method not implemented.");
  }

  getOfflineSignerDirect(chainId: string): OfflineDirectSigner {
    throw new Error("Method not implemented.");
  }

  signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<AminoSignResponse> {
    throw new Error("Method not implemented.");
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