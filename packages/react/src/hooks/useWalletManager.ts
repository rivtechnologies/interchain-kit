
import { useInterChainWalletContext } from "../provider"

export const useWalletManager = () => {
  const { walletManager } = useInterChainWalletContext()
  return walletManager
}