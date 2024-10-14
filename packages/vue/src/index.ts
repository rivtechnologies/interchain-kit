
import { AssetList, Chain } from '@chain-registry/v2-types';
import {
  BaseWallet,
  EndpointOptions,
  SignerOptions,
  WalletManager,
} from '@interchain-kit/core';
import { App, Plugin } from 'vue';

type InterchainWalletProviderProps = {
  chains: Chain[];
  assetLists: AssetList[];
  wallets: BaseWallet[];
  signerOptions: SignerOptions;
  endpointOptions: EndpointOptions;
};

export const WALLET_MANAGER_KEY = Symbol('walletManagerKey');

export const walletManagerPlugin: Plugin = {
  install(app: App, config: InterchainWalletProviderProps) {
    const { chains, assetLists, wallets, signerOptions, endpointOptions } = config;
    const walletManager = new WalletManager(
      chains,
      assetLists,
      wallets,
      signerOptions,
      endpointOptions,
    );
    walletManager.init();
    app.provide(WALLET_MANAGER_KEY, walletManager);
  }
};

export * from './hooks';
export * from './modal';