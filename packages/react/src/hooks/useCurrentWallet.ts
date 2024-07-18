import { useWalletManager } from "./useWalletManager"

export const useCurrentWallet = () => {
    const walletManager = useWalletManager()
    return walletManager.currentWallet
}