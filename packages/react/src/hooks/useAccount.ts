import { WalletState } from "@interchain-kit/core"
import { useWalletManager } from './useWalletManager';
import { useEffect } from "react";

export const useAccount = (chainName: string, walletName: string) => {
  const walletManager = useWalletManager()

  const chainAccount = walletManager.getWalletRepositoryByName(walletName)?.getChainAccountByName(chainName)

  useEffect(() => {
    if (chainAccount?.walletState === WalletState.Connected && chainName && walletName) {
      chainAccount.getAccount()
    }
  }, [chainName, walletName, chainAccount?.walletState])

  if (chainAccount?.walletState === WalletState.Connected && chainName && walletName) {
    return {
      account: chainAccount?.account,
      isLoading: chainAccount.getAccountState().loading,
      error: chainAccount.getAccountState().error,
      getAccount: () => chainAccount?.getAccount()
    }
  }

  return {
    account: undefined,
    isLoading: false,
    error: null,
    getAccount: () => chainAccount?.getAccount()
  }

}