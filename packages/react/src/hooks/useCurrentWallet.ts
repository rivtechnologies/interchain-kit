import { useEffect } from "react"
import { useWalletManager } from "./useWalletManager"
import { useWalletModal } from "../modal"
import { WalletManagerState } from "@interchain-kit/core"

export const useCurrentWallet = () => {
  const walletManager = useWalletManager()
  const { open } = useWalletModal()

  useEffect(() => {
    console.log(walletManager.currentWalletName, walletManager.state)
    if (!walletManager.currentWalletName && walletManager.state === WalletManagerState.Initialized) {
      console.log('do i open this ?')
      open()
    }
  }, [walletManager.currentWalletName, walletManager.state])


  return walletManager.getCurrentWallet()
}