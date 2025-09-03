import { isInstanceOf } from '@interchain-kit/core';
import { CosmosWallet, EthereumWallet, MultiChainWallet } from '@interchain-kit/core';

import { InterchainStore } from '../store';
import { createCosmosWallet } from './cosmos-wallet';
import { createEthereumWallet } from './ethereum-wallet';
import { createMultiChainWallet } from './multi-chain-wallet';
// import { createWCWallet } from './wc-wallet';

export const createProxiedWallet = <T>(wallet: T, store: InterchainStore): T => {
  // WalletConnect wallets are now handled by the generic AOP system
  // No need for special handling
  if (isInstanceOf(wallet, CosmosWallet)) {
    return createCosmosWallet(wallet, store) as T;
  }
  if (isInstanceOf(wallet, EthereumWallet)) {
    return createEthereumWallet(wallet, store) as T;
  }
  if (isInstanceOf(wallet, MultiChainWallet)) {
    Array.from(wallet.networkWalletMap.keys()).forEach(chainType => {
      const chainWallet = wallet.networkWalletMap.get(chainType);
      if (isInstanceOf(chainWallet, CosmosWallet)) {
        wallet.setNetworkWallet(chainType, createCosmosWallet(chainWallet, store));
      }
      if (isInstanceOf(chainWallet, EthereumWallet)) {
        wallet.setNetworkWallet(chainType, createEthereumWallet(chainWallet, store));
      }
    });

    return createMultiChainWallet(wallet, store) as T;
  }

  // Return original wallet if no specific type matches
  return wallet;
};