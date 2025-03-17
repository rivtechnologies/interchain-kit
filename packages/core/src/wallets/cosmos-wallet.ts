import { BroadcastMode, IGenericOfflineSigner, StdSignDoc } from '@interchainjs/types';
import { AminoGenericOfflineSigner, AminoSignResponse, DirectGenericOfflineSigner, DirectSignResponse, StdSignature } from "@interchainjs/cosmos/types/wallet";
import { BaseWallet } from "./base-wallet";
import { DirectSignDoc, SignOptions, SignType, WalletAccount } from '../types';
import { getClientFromExtension } from '../utils';
import { chainRegistryChainToKeplr } from '@chain-registry/v2-keplr';

export class CosmosWallet extends BaseWallet {

  async init(): Promise<void> {
    try {
      this.client = await getClientFromExtension(this.info.windowKey)
    } catch (error) {
      this.errorMessage = (error as any).message
      throw error
    }
  }
  async connect(chainId: string): Promise<void> {
    try {
      await this.client.enable(chainId)
    } catch (error) {
      if ((error as any).message !== `Request rejected`) {
        await this.addSuggestChain(chainId)
      }
      throw error
    }
  }
  async disconnect(chainId: string): Promise<void> {
    await this.client.disable(chainId)
  }
  async getAccount(chainId: string): Promise<WalletAccount> {
    const key = await this.client.getKey(chainId);
    return {
      username: key.name,
      address: key.bech32Address,
      algo: key.algo,
      pubkey: key.pubKey,
      isNanoLedger: key.isNanoLedger,
    };
  }
  async getOfflineSigner(chainId: string, preferredSignType?: SignType) {
    if (preferredSignType === 'amino') {
      return new AminoGenericOfflineSigner({
        getAccounts: async () => [await this.getAccount(chainId)],
        signAmino: async (signer, signDoc) => {
          return this.client.signAmino(chainId, signer, signDoc)
        }
      }) as IGenericOfflineSigner
    } else {
      return new DirectGenericOfflineSigner({
        getAccounts: async () => [await this.getAccount(chainId)],
        signDirect: async (signer, signDoc) => {
          return this.client.signDirect(chainId, signer, signDoc)
        }
      }) as IGenericOfflineSigner
    }
  }
  async signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<AminoSignResponse> {
    throw new Error('Method not implemented.');
  }
  signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature> {
    throw new Error('Method not implemented.');
  }
  verifyArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  async signDirect(chainId: string, signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions): Promise<DirectSignResponse> {
    throw new Error('Method not implemented.');
  }
  async sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }
  async addSuggestChain(chainId: string): Promise<void> {
    const chain = this.chainMap.get(chainId)
    const chainInfo = chainRegistryChainToKeplr(chain, this.assetLists)
    return this.client.experimentalSuggestChain(chainInfo);
  }
  async getProvider() {
    return this.client
  }
}