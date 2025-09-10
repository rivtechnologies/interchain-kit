import { WalletState } from '@interchain-kit/core';

import { useAsync } from './useAsync';
import { useWalletManager } from './useWalletManager';

export const useSigningClient = (chainName: string, walletName: string) => {
  const { getSigningClient, getChainWalletState, getRpcEndpoint, isReady, getChainByName } = useWalletManager();

  const chain = getChainByName(chainName);

  if (chain.chainType !== 'cosmos') {
    return {
      signingClient: null,
      isLoading: false,
      error: null,
    };
  }

  const chainWalletState = getChainWalletState(walletName, chainName);

  const { data, isLoading, error } = useAsync({
    queryKey: `signing-client-${chainName}-${walletName}`,
    queryFn: async () => {
      await getRpcEndpoint(walletName, chainName);
      const currentWalletState = getChainWalletState(walletName, chainName)?.walletState;
      if (currentWalletState === WalletState.Connected) {
        return getSigningClient(walletName, chainName);
      }
    },
    enabled: chainWalletState?.walletState === WalletState.Connected && isReady,
    disableCache: true,
  });

  return {
    signingClient: data,
    error,
    isLoading,
  };
};
