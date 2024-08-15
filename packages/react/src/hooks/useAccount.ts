import { useEffect, useState } from "react"
import { WalletAccount } from "@interChain-kit/core"
import { useWalletManager } from './useWalletManager';

export const useAccount = (chainName: string, walletName: string): WalletAccount | null => {
  const walletManager = useWalletManager()

  const wallet = walletManager.wallets.find(w => w.option.name === walletName)

  const [account, setAccount] = useState<WalletAccount | null>(null)

  const chain = walletManager.chains.find(c => c.chainName === chainName)

  const getAccount = async () => {
    const account = await wallet.getAccount(chain.chainId)
    setAccount(account)
  }

  useEffect(() => {
    if (wallet) {
      wallet.events.on('keystoreChange', getAccount)
    }
  }, [wallet])

  useEffect(() => {
    if (!wallet) {
      setAccount(null)
      return
    }
    getAccount()
  }, [wallet, chainName, wallet?.walletState])

  return account
}