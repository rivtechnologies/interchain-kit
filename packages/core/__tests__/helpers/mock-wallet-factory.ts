import { Chain, AssetList } from '@chain-registry/v2-types';


import { StdSignDoc } from '@interchainjs/types';
import { BroadcastMode, DirectSignDoc, SignOptions, SimpleAccount, Wallet, WalletAccount } from '../../src/types';
import { BaseWallet } from '../../src/base-wallet';
import { AminoSignResponse, DirectSignResponse, OfflineAminoSigner, OfflineDirectSigner, OfflineSigner, StdSignature } from '@interchainjs/cosmos/types/wallet';

type MockAccount = {
  chainId: string;
  walletName: string;
  account: WalletAccount
}

export const createMockAccount = (addressPrefix: string) => {
  const account: WalletAccount = {
    address: `${addressPrefix}xxxxxxx`,
    algo: 'secp256k1',
    pubkey: new Uint8Array(0)
  }
  return account
}


export class MockBaseWallet extends BaseWallet {
  mockAccounts: MockAccount[] = [];

  init(meta?: unknown): Promise<void> {
    return Promise.resolve();
  }
  connect(chainId: string | string[]): Promise<void> {
    return Promise.resolve();
  }
  disconnect(chainId: string | string[]): Promise<void> {
    return Promise.resolve();
  }
  getAccount(chainId: string): Promise<WalletAccount> {
    return this.mockAccounts.find(a => a.chainId === chainId)?.account ? Promise.resolve(this.mockAccounts.find(a => a.chainId === chainId)!.account) : Promise.reject('Account not found');
  }
  getAccounts(chainIds: string[]): Promise<WalletAccount[]> {
    throw new Error('Method not implemented.');
  }
  getSimpleAccount(chainId: string): Promise<SimpleAccount> {
    throw new Error('Method not implemented.');
  }
  getOfflineSigner(chainId: string): OfflineSigner {
    throw new Error('Method not implemented.');
  }
  getOfflineSignerAmino(chainId: string): OfflineAminoSigner {
    throw new Error('Method not implemented.');
  }
  getOfflineSignerDirect(chainId: string): OfflineDirectSigner {
    throw new Error('Method not implemented.');
  }
  signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<AminoSignResponse> {
    throw new Error('Method not implemented.');
  }
  signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature> {
    throw new Error('Method not implemented.');
  }
  verifyArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  signDirect(chainId: string, signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions): Promise<DirectSignResponse> {
    throw new Error('Method not implemented.');
  }
  sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }
  addSuggestChain(chain: Chain, assetLists: AssetList[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

export const createMockWallet = (info: Wallet) => {
  const mockWallet = new MockBaseWallet(info);



  return mockWallet
}