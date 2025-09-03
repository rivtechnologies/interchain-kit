import { EthereumWallet, WalletState } from '@interchain-kit/core';

import { InterchainStore } from '../store';
import { createAOPProxy } from '../utils';

export const createEthereumWallet = (target: EthereumWallet, store: InterchainStore) => {
  return createAOPProxy({
    target,
    advice: {
      sendTransaction: {
        onError(methodName, target, error, transactionParameters) {
          const chain = target.getChainById(transactionParameters.chainId);
          store.updateChainWalletState(target.info.name, chain.chainName, { errorMessage: error.message });
          throw error; // 重新抛出错误
        },
      },
      signMessage: {
        onError(methodName, target, error, message) {
          target.getCurrentChainId().then(chainId => {
            const chain = target.getChainById(chainId);
            store.updateChainWalletState(target.info.name, chain.chainName, { errorMessage: error.message });
          });
          throw error; // 重新抛出错误
        }
      },
    }
  });
};