import { inject, Reactive } from 'vue';
import { WalletManager } from '@interchain-kit/core';
import { WALLET_MANAGER_KEY } from '../utils';

export const useWalletManager = (): Reactive<WalletManager> => {
  return inject(WALLET_MANAGER_KEY);
};