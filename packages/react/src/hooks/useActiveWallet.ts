import { useEffect } from "react"
import { useWalletManager } from "./useWalletManager"
import { useWalletModal } from "../modal"

export const useActiveWallet = () => {
  const walletManager = useWalletManager()
  const { open } = useWalletModal()

  useEffect(() => {
    if (!walletManager.activeWallet) {
      open()
    }
  }, [walletManager.activeWallet])


  return walletManager.getActiveWallet()
}