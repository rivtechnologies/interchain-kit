import { CosmosWallet } from '@interchain-kit/core';

import { InterchainStore } from '../store';
import { createAOPProxy } from '../utils';

export const createCosmosWallet = (target: CosmosWallet, store: InterchainStore) => {
  return createAOPProxy({
    target,
    advice: {
      signAmino: {
        before(methodName, target, chainId, signer, signDoc, signOptions) {
          console.log('signAmino before - AOP proxy is working!', methodName, chainId);
        },
        onError(methodName, target, error, chainId, signer, signDoc, signOptions) {
          console.log('signAmino onError - AOP caught error!', error, chainId);
          const chain = target.getChainById(chainId);
          store.updateChainWalletState(target.info.name, chain.chainName, { errorMessage: (error as Error).message });
          throw error; // 重新抛出错误
        },
      },
      signDirect: {
        async around(methodName, target, originalMethod, chainId, signer, signDoc, signOptions) {
          console.log('signDirect around - AOP is working!', methodName, chainId);
          try {
            const result = await originalMethod(chainId, signer, signDoc, signOptions);
            console.log('signDirect success - AOP is working!', methodName, chainId);
            return result;
          } catch (error) {
            console.log('signDirect error - AOP caught the error!', error, chainId);
            const chain = target.getChainById(chainId);
            store.updateChainWalletState(target.info.name, chain.chainName, { errorMessage: (error as Error).message });
            throw error; // 重新抛出错误
          }
        }
      },
      signArbitrary: {
        async around(methodName, target, originalMethod, chainId, signer, data) {
          console.log('signArbitrary around - AOP is working!', methodName, chainId);
          try {
            const result = await originalMethod(chainId, signer, data);
            console.log('signArbitrary success - AOP is working!', methodName, chainId);
            return result;
          } catch (error) {
            console.log('signArbitrary error - AOP caught the error!', error, chainId);
            const chain = target.getChainById(chainId);
            store.updateChainWalletState(target.info.name, chain.chainName, { errorMessage: (error as Error).message });
            throw error; // 重新抛出错误
          }
        },
      }
    },
  });
};