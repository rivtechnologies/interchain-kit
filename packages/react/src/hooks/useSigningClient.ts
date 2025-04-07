import { useEffect, useState } from "react"
import { useWalletManager } from "./useWalletManager"
import { WalletState } from "@interchain-kit/core"

export const useSigningClient = (chainName: string, walletName: string) => {
  const { getSigningClient, getChainWalletState } = useWalletManager()
  const [signingClient, setSigningClient] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const chainWalletState = getChainWalletState(walletName, chainName)

  useEffect(() => {
    const handleGetSigningClient = async () => {

      if (!chainName || !walletName || !(chainWalletState?.walletState === WalletState.Connected) || !chainWalletState?.rpcEndpoint) {
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      try {
        const client = await getSigningClient(walletName, chainName)
        setSigningClient(client)
        setError(null)

      } catch (error) {
        console.log("Error getting signing client", error)
        setError((error as any).message)
        setSigningClient(null)

      } finally {
        setIsLoading(false)
      }
    }

    handleGetSigningClient()
  }, [chainName, walletName, chainWalletState?.walletState, chainWalletState?.rpcEndpoint])

  return {
    signingClient,
    error,
    isLoading,
  }
}