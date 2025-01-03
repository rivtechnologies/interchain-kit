
import { useWalletManager } from './useWalletManager';
import { WalletState } from '@interchain-kit/core';

export const useInterchainClient = (chainName: string, walletName: string) => {
  const walletManager = useWalletManager()

  const chainAccount = walletManager.getWalletRepositoryByName(walletName)?.getChainAccountByName(chainName)

  if (chainAccount && chainAccount.walletState === WalletState.Connected) {
    return {
      signingClient: chainAccount?.signingClient,
      isLoading: chainAccount?.getSigningClientState().loading,
      error: chainAccount?.getSigningClientState().error,
      getSigningClient: () => chainAccount?.getSigningClient()
    }
  }
  return {
    signingClient: undefined,
    isLoading: false,
    error: undefined,
    getSigningClient: () => chainAccount?.getSigningClient()
  }
}