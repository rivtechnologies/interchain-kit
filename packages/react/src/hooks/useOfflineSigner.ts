import { useWalletManager } from "./useWalletManager"

export const useOfflineSigner = (chainName: string, walletName: string) => {
  const walletManager = useWalletManager()
  const wallet = walletManager.wallets.find((w) => w.option.name === walletName)
  return {
    offlineSigner: walletManager.getOfflineSigner(wallet, chainName),
  }
}