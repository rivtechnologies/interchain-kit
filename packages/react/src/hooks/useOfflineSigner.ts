import { useEffect } from "react"
import { useWalletManager } from "./useWalletManager"
import { WalletState } from "@interchain-kit/core"

export const useOfflineSigner = (chainName: string, walletName: string) => {
  const walletManager = useWalletManager()

  const chainAccount = walletManager.getWalletRepositoryByName(walletName)?.getChainAccountByName(chainName)

  useEffect(() => {
    if (chainAccount?.walletState === WalletState.Connected && !chainAccount.offlineSigner && chainName && walletName) {
      chainAccount.getOfflineSigner()
    }
  }, [chainAccount?.walletState, chainName, walletName])

  return {
    offlineSigner: chainAccount?.offlineSigner,
    isLoading: chainAccount?.getOfflineSignerState().loading,
    error: chainAccount?.getOfflineSignerState().error,
    getOfflineSigner: chainAccount?.getOfflineSigner
  }
}