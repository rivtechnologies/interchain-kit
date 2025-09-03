import { MultiChainWallet, WalletState } from '@interchain-kit/core';

import { InterchainStore } from '../store';
import { createAOPProxy } from '../utils/aop';


export const createMultiChainWallet = (target: MultiChainWallet, store: InterchainStore) => {
  return createAOPProxy({
    target,
    advice: {
      connect: {
        async around(methodName: any, target: any, originalMethod: any, chainId: any) {
          const chain = target.getChainById(chainId);
          store.updateChainWalletState(target.info.name, chain.chainName, { walletState: WalletState.Connecting });
          await originalMethod(chainId);
          const account = await target.getAccount(chainId);
          store.updateChainWalletState(target.info.name, chain.chainName, {
            walletState: WalletState.Connected,
            account
          });
        }
      },
      disconnect: {
        after(methodName: any, target: any, result: any, chainId: any) {
          const chain = target.getChainById(chainId);
          store.updateChainWalletState(target.info.name, chain.chainName, { walletState: WalletState.Disconnected });
        },
      },
    }
  });
};