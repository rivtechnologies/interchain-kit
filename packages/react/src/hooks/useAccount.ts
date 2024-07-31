import { useEffect, useState } from "react"
import { useActiveWallet } from "./useActiveWallet"
import { WalletAccount } from "@interChain-kit/core"
import { useWalletManager } from './useWalletManager';

export const useAccount = (chainName: string): WalletAccount | null => {
  const walletManager = useWalletManager()

  const currentWallet = useActiveWallet()

  const [account, setAccount] = useState<WalletAccount | null>(null)

  const chain = walletManager.chains.find(c => c.chainName === chainName)

  const getAccount = async () => {
    const account = await currentWallet.getAccount(chain.chainId)
    setAccount(account)
  }

  useEffect(() => {
    if (currentWallet) {
      currentWallet.events.on('keystoreChange', getAccount)
    }
  }, [currentWallet])

  useEffect(() => {
    if (!currentWallet) {
      setAccount(null)
      return
    }
    getAccount()
  }, [currentWallet, chainName, currentWallet?.walletState])

  return account
}