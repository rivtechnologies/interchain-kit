import { useMemo } from "react"
import { useWalletManager } from "./useWalletManager"
import { WalletState } from "@interchain-kit/core"

export const useOfflineSigner = (chainName: string, walletName: string) => {
  const walletManager = useWalletManager()

  const chainAccount = walletManager.getWalletRepositoryByName(walletName)?.getChainAccountByName(chainName)

  if (chainAccount && chainAccount.walletState === WalletState.Connected) {
    return {
      offlineSigner: chainAccount?.offlineSigner,
      isLoading: chainAccount?.getOfflineSignerState().loading,
      error: chainAccount?.getOfflineSignerState().error,
      getOfflineSigner: () => chainAccount?.getOfflineSigner()
    }
  }
  return {
    offlineSigner: undefined,
    isLoading: false,
    error: undefined,
    getOfflineSigner: () => chainAccount?.getOfflineSigner()
  }
}