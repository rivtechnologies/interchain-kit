import { EthereumWallet, WalletState } from '@interchain-kit/core';

import { InterchainStore } from '../store';
import { createAOPProxy } from '../utils';

export const createEthereumWallet = (target: EthereumWallet, store: InterchainStore) => {
  return createAOPProxy({
    target,
    advice: {
      connect: {
        async around(methodName, target, originalMethod, chainId) {
          const chain = target.getChainById(chainId);
          store.updateChainWalletState(target.info.name, chain.chainName, { walletState: WalletState.Connecting });
          const result = await originalMethod(chainId);
          store.updateChainWalletState(target.info.name, chain.chainName, { walletState: WalletState.Connected });
          return result;
        },
      },
      getAccount: {
        async around(methodName, target, originalMethod, chainId) {
          const chain = target.getChainById(chainId);
          const existedAccount = store.getChainWalletState(target.info.name, chain.chainName)?.account;
          if (existedAccount) {
            return existedAccount;
          }
          store.updateChainWalletState(target.info.name, chain.chainName, { walletState: WalletState.Connecting });
          const result = await originalMethod(chainId);
          store.updateChainWalletState(target.info.name, chain.chainName, { walletState: WalletState.Connected, account: result });
          return result;
        },
      },
      sendTransaction: {
        onError(methodName, target, error, transactionParameters) {
          const chain = target.getChainById(transactionParameters.chainId);
          store.updateChainWalletState(target.info.name, chain.chainName, { errorMessage: error.message });
          throw error; // 重新抛出错误
        },
      },
      signMessage: {
        before(methodName, target, message) {
          // 清除之前的错误信息
          target.getCurrentChainId().then(chainId => {
            const chain = target.getChainById(chainId);
            store.updateChainWalletState(target.info.name, chain.chainName, { errorMessage: '' });
          });
        },
        after(methodName, target, result, message) {
          // 签名成功后的处理（可选）
          console.log('Message signed successfully');
        },
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