import { AssetList, Chain } from '@chain-registry/types';
import { StdSignature } from '@interchainjs/amino';
import { AminoSignResponse, DirectSignResponse } from '@interchainjs/cosmos';
import { StdSignDoc } from '@interchainjs/types';

import { SignType } from './common';
import { OfflineAminoSigner, OfflineDirectSigner } from './cosmos';
import { BroadcastMode, DirectSignDoc, SignOptions } from './wallet';
import { WalletAccount } from './wallet';

export interface IBaseWallet {
  setChainMap(chains: Chain[]): void;
  addChain(chain: Chain): void;
  setAssetLists(assetLists: AssetList[]): void;
  addAssetList(assetList: AssetList): void;
  getChainById(chainId: Chain['chainId']): Chain;
  getAssetListByChainId(chainId: Chain['chainId']): AssetList;
  init(): Promise<void>;
  connect(chainId: Chain['chainId']): Promise<void>;
  disconnect(chainId: Chain['chainId']): Promise<void>;
  getAccount(chainId: Chain['chainId']): Promise<WalletAccount>;
  addSuggestChain(chainId: Chain['chainId']): Promise<void>;
  getProvider(chainId: Chain['chainId']): Promise<any>;
}

export interface ICosmosWallet extends IBaseWallet {
  // Cosmos-specific methods
  getOfflineSigner(chainId: Chain['chainId'], preferredSignType: SignType): Promise<OfflineAminoSigner | OfflineDirectSigner>;
  setSignOptions(options: SignOptions): void;
  bindingEvent(): void;
  signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<AminoSignResponse>;
  signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature>;
  verifyArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<boolean>;
  signDirect(chainId: string, signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions): Promise<DirectSignResponse>;
  sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array>;
}

export interface IEthereumWallet extends IBaseWallet {
  // Ethereum-specific properties
  ethereum: any;
  isSwitchingNetwork: boolean;

  // Ethereum-specific methods
  bindingEvent(): void;
  switchChain(chainId: string): Promise<void>;
  sendTransaction(transactionParameters: any): Promise<string>;
  signMessage(message: string): Promise<string>;
  getCurrentChainId(): Promise<string>;
  request(method: string, params?: any[]): Promise<any>;
}

export interface ISolanaWallet extends IBaseWallet {
  // Solana-specific properties
  solana: any;

  // Solana-specific methods
  bindingEvent(): void;

  // Solana provider methods
  request(method: string, params: any): Promise<any>;
  signAllTransactions(transactions: any[]): Promise<any[]>;
  signAndSendAllTransactions(transactions: any[]): Promise<any>;
  signAndSendTransaction(transaction: any): Promise<string>;
  signIn(data: any): Promise<{ address: string; signature: Uint8Array; signedMessage: Uint8Array }>;
  signMessage(message: Uint8Array, encoding?: 'utf8' | 'hex'): Promise<Uint8Array>;
  signTransaction(transaction: any): Promise<any>;
}

// Test: This interface should be properly exported and available for use
// Example usage:
// const wallet: ICosmosWallet = new CosmosWallet(walletInfo);