import { WalletAccount, WalletState } from '@interchain-kit/core';

export type ChainWalletState = {
  chainName: string;
  walletName: string;
  walletState: WalletState;
  rpcEndpoint: string;
  errorMessage: string;
  account: WalletAccount | undefined;
};


export type InterchainStoreType = {
  currentWalletName: string;
  currentChainName: string;
  chainWalletStates: ChainWalletState[];
  isReady: boolean;
  modalIsOpen: boolean;
  walletConnectQRCodeUri: string
};