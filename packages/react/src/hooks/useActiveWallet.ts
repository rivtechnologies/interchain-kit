import { useWalletManager } from "./useWalletManager"

export const useActiveWallet = () => {
    const walletManager = useWalletManager()
    return walletManager.currentWallet
}