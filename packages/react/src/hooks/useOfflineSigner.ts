import { OfflineSigner } from '@interchainjs/cosmos/types/wallet';
import { useEffect, useState } from "react"
import { useWalletManager } from "./useWalletManager"

export const useOfflineSigner = (chainName: string, walletName: string) => {
  const walletManager = useWalletManager()
  const wallet = walletManager.wallets.find((w) => w.info.name === walletName)

  const [offlineSigner, setOfflineSigner] = useState<OfflineSigner | null>(null)

  useEffect(() => {
    if (wallet && chainName) {
      setOfflineSigner(walletManager.getOfflineSigner(wallet, chainName))
    }
  }, [wallet, chainName])

  return {
    offlineSigner
  }
}