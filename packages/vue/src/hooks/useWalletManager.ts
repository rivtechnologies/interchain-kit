import { inject } from 'vue';
import { WalletManager } from '@interchain-kit/core';
import { WALLET_MANAGER_KEY } from '..';

export const useWalletManager = (): WalletManager => {
  return inject(WALLET_MANAGER_KEY);
};