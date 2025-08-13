import { StdSignDoc } from '@interchainjs/types';
import { BaseWallet } from "./base-wallet";
import { BroadcastMode, DirectSignDoc, SignOptions, SignType, WalletAccount } from '../types';
import { getClientFromExtension } from '../utils';
import { chainRegistryChainToKeplr } from '@chain-registry/keplr';
import { OfflineAminoSigner, OfflineDirectSigner } from '../types/cosmos';
import { AminoSignResponse, DirectSignResponse } from '@interchainjs/cosmos';
import { StdSignature } from '@interchainjs/amino';

export class CosmosWallet extends BaseWallet {

  defaultSignOptions = {
    preferNoSetFee: true,
    preferNoSetMemo: true,
    disableBalanceCheck: false,
  }

  setSignOptions(options: SignOptions) {
    this.defaultSignOptions = {
      ...this.defaultSignOptions,
      ...options,
    }
  }
  bindingEvent() {
    window.addEventListener(this.info.keystoreChange, () => {
      this.events.emit('accountChanged', () => { })
    })
  }
  async init(): Promise<void> {
    this.bindingEvent()
    this.client = await getClientFromExtension(this.info.cosmosKey)
  }

  async connect(chainId: string): Promise<void> {
    try {
      await this.client.enable(chainId)
    } catch (error) {
      if (!(error as any).message.includes(`rejected`)) {
        await this.addSuggestChain(chainId)
      } else {
        throw error
      }
    }
  }
  async disconnect(chainId: string): Promise<void> {
    this.client.disable?.(chainId);
    this.client.disconnect?.(chainId);
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
  async getOfflineSigner(chainId: string, preferredSignType?: SignType): Promise<OfflineAminoSigner | OfflineDirectSigner> {
    const account = await this.getAccount(chainId);

    if (account.isNanoLedger) {
      return {
        getAccounts: async () => [account],
        signAmino: async (signer: string, signDoc: StdSignDoc) => {
          return this.signAmino(chainId, signer, signDoc, this.defaultSignOptions)
        }
      }
    }


    if (preferredSignType === 'amino') {
      return {
        getAccounts: async () => [await this.getAccount(chainId)],
        signAmino: async (signer: string, signDoc: StdSignDoc) => {
          return this.signAmino(chainId, signer, signDoc, this.defaultSignOptions)
        }
      }
    } else {
      return {
        getAccounts: async () => [await this.getAccount(chainId)],
        signDirect: async (signer: string, signDoc: DirectSignDoc) => {
          return this.signDirect(chainId, signer, signDoc, this.defaultSignOptions)
        }
      }
    }
  }
  async signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<AminoSignResponse> {
    return this.client.signAmino(chainId, signer, signDoc, signOptions)
  }
  async signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature> {
    return this.client.signArbitrary(chainId, signer, data)
  }
  verifyArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<boolean> {
    return this.client.verifyArbitrary(chainId, signer, data)
  }
  async signDirect(chainId: string, signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions): Promise<DirectSignResponse> {
    return this.client.signDirect(chainId, signer, signDoc, signOptions)
  }
  async sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array> {
    return this.client.sendTx(chainId, tx, mode)
  }
  async addSuggestChain(chainId: string): Promise<void> {
    const chain = this.getChainById(chainId)
    const chainInfo = chainRegistryChainToKeplr(chain, this.assetLists)
    try {
      await this.client.experimentalSuggestChain(chainInfo)
    } catch (error) {
      console.log('add suggest chain error', error)
      throw error
    }
  }
  async getProvider() {
    return this.client
  }
}