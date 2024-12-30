import { WalletState } from "@interchain-kit/core"
import { useWalletManager } from './useWalletManager';
import { useEffect } from "react";

export const useAccount = (chainName: string, walletName: string) => {
  const walletManager = useWalletManager()

  const chainAccount = walletManager.getWalletRepositoryByName(walletName)?.getChainAccountByName(chainName)

  useEffect(() => {
    if (chainAccount?.walletState === WalletState.Connected && !chainAccount?.account && chainName && walletName) {
      chainAccount.getAccount()
    }
  }, [chainAccount?.walletState, chainName, walletName])

  return {
    account: chainAccount?.account || undefined,
    isLoading: chainAccount?.getAccountState().loading || false,
    error: chainAccount?.getAccountState().error || undefined,
    getAccount: chainAccount?.getAccount
  }
}