import { useEffect } from "react"
import { useWalletManager } from "./useWalletManager"
import { useWalletModal } from "../modal"

export const useActiveWallet = () => {
  const walletManager = useWalletManager()
  const { open } = useWalletModal()

  useEffect(() => {
    if (!walletManager.activeWalletName) {
      open()
    }
  }, [walletManager.activeWalletName])


  return walletManager.getActiveWallet()
}