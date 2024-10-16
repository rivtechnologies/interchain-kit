import { inject } from 'vue';
import { WalletManager } from '@interchain-kit/core';
import { WALLET_MANAGER_KEY } from '../utils';

export const useWalletManager = (): WalletManager => {
  return inject(WALLET_MANAGER_KEY);
};