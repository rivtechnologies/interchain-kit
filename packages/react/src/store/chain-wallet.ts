import { Chain, AssetList } from "@chain-registry/v2-types";
import { BaseWallet, BroadcastMode, DirectSignDoc, SignOptions, SimpleAccount, WalletAccount } from "@interchain-kit/core";
import { OfflineSigner, OfflineAminoSigner, OfflineDirectSigner, AminoSignResponse, StdSignature, DirectSignResponse } from "@interchainjs/cosmos/types/wallet";
import { StdSignDoc } from "@interchainjs/types";

export class ChainWallet<TWallet extends BaseWallet> extends BaseWallet {
  originalWallet: TWallet;

  connectWithState: TWallet['connect']
  disconnectWithState: TWallet['disconnect']
  getAccountWithState: TWallet['getAccount']

  constructor(
    originalWallet: TWallet,
    connectWithState: TWallet['connect'],
    disconnectWithState: TWallet['disconnect'],
    getAccountWithState: TWallet['getAccount']
  ) {
    super(originalWallet?.info);
    this.originalWallet = originalWallet;

    this.connectWithState = connectWithState
    this.disconnectWithState = disconnectWithState
    this.getAccountWithState = getAccountWithState
  }
  async init(meta?: unknown): Promise<void> {
    return this.originalWallet.init(meta);
  }
  async connect(chainId: string | string[]): Promise<void> {
    return this.connectWithState(chainId);
  }
  async disconnect(chainId: string | string[]): Promise<void> {
    return this.disconnectWithState(chainId);
  }
  async getAccount(chainId: string): Promise<WalletAccount> {
    return this.getAccountWithState(chainId);
  }
  async getAccounts(chainIds: string[]): Promise<WalletAccount[]> {
    return this.originalWallet.getAccounts(chainIds);
  }
  async getSimpleAccount(chainId: string): Promise<SimpleAccount> {
    return this.originalWallet.getSimpleAccount(chainId);
  }
  getOfflineSigner(chainId: string): OfflineSigner {
    return this.originalWallet.getOfflineSigner(chainId);
  }
  getOfflineSignerAmino(chainId: string): OfflineAminoSigner {
    return this.originalWallet.getOfflineSignerAmino(chainId);
  }
  getOfflineSignerDirect(chainId: string): OfflineDirectSigner {
    return this.originalWallet.getOfflineSignerDirect(chainId);
  }
  async signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<AminoSignResponse> {
    return this.originalWallet.signAmino(chainId, signer, signDoc, signOptions);
  }
  async signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature> {
    return this.originalWallet.signArbitrary(chainId, signer, data);
  }
  async verifyArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<boolean> {
    return this.originalWallet.verifyArbitrary(chainId, signer, data);
  }
  async signDirect(chainId: string, signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions): Promise<DirectSignResponse> {
    return this.originalWallet.signDirect(chainId, signer, signDoc, signOptions);
  }
  async sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array> {
    return this.originalWallet.sendTx(chainId, tx, mode);
  }
  async addSuggestChain(chain: Chain, assetLists: AssetList[]): Promise<void> {
    return this.originalWallet.addSuggestChain(chain, assetLists);
  }
}