import { useEffect, useState } from "react"
import { useWalletManager } from "./useWalletManager"
import { WalletState } from "@interchain-kit/core"

export const useSigningClient = (chainName: string, walletName: string) => {
  const { getSigningClient, getChainWalletState } = useWalletManager()
  const [signingClient, setSigningClient] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const chainWalletState = getChainWalletState(walletName, chainName)

  const handleGetSigningClient = async () => {
    if (!chainName || !walletName || !(chainWalletState.walletState === WalletState.Connected)) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const client = await getSigningClient(walletName, chainName)
      setSigningClient(client)
      setError(null)

    } catch (error) {
      setError((error as any).message)
      setSigningClient(null)

    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    handleGetSigningClient()
  }, [chainName, walletName, chainWalletState?.walletState])

  return {
    signingClient,
    error,
    isLoading,
  }
}