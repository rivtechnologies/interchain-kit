import { SolanaWallet } from '@interchain-kit/core';

import { InterchainStore } from '../store';
import { createAOPProxy } from '../utils';

export const createSolanaWallet = (target: SolanaWallet, store: InterchainStore) => {
  return createAOPProxy({
    target,
    advice: {
      signTransaction: {
        onError(methodName, target, error, transaction) {
          store.updateChainWalletState(target.info.name, 'solana', { errorMessage: error.message });
        },
      },
    }
  });
};