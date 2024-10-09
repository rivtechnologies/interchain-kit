import { useEffect } from "react"
import { useWalletManager } from "./useWalletManager"
import { useWalletModal } from "../modal"
import { WalletManagerState } from "@interchain-kit/core"

export const useCurrentWallet = () => {
  const walletManager = useWalletManager()
  const { open } = useWalletModal()

  useEffect(() => {
    if (!walletManager.currentWalletName && walletManager.state === WalletManagerState.Initialized) {
      open()
    }
  }, [walletManager.currentWalletName, walletManager.state])


  return walletManager.getCurrentWallet()
}