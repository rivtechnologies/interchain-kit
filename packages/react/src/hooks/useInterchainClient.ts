import { useEffect } from "react";
import { useWalletManager } from './useWalletManager';
import { WalletState } from '@interchain-kit/core';

export const useInterchainClient = (chainName: string, walletName: string) => {
  const walletManager = useWalletManager()

  const chainAccount = walletManager.getWalletRepositoryByName(walletName)?.getChainAccountByName(chainName)

  useEffect(() => {
    if (chainAccount?.walletState === WalletState.Connected && !chainAccount.signingClient && chainName && walletName) {
      chainAccount.getSigningClient()
    }
  }, [chainAccount?.walletState, chainName, walletName])

  return {
    signingClient: chainAccount?.signingClient,
    isLoading: chainAccount?.getSigningClientState().loading,
    error: chainAccount?.getSigningClientState().error,
    getSigningClient: chainAccount?.getSigningClient
  }
}