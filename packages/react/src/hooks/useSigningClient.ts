import { useEffect, useState } from "react"
import { useWalletManager } from "./useWalletManager"
import { WalletState } from "@interchain-kit/core"

export const useSigningClient = (chainName: string, walletName: string) => {
  const { getSigningClient, getChainWalletState, getRpcEndpoint } = useWalletManager()

  const [signingClient, setSigningClient] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const chainWalletState = getChainWalletState(walletName, chainName)

  useEffect(() => {
    if (
      chainWalletState?.walletState === WalletState.Connected
    ) {
      const handleGetSigningClient = async () => {
        setIsLoading(true)
        try {
          await getRpcEndpoint(walletName, chainName)
          const client = await getSigningClient(walletName, chainName)
          setSigningClient(client)
          setError(null)
        } catch (error) {
          console.error("Error getting signing client", error)
          setError((error as any).message)
          setSigningClient(null)
        } finally {
          setIsLoading(false)
        }
      }

      handleGetSigningClient()
    }
  }, [chainWalletState?.walletState])

  return {
    signingClient,
    error,
    isLoading,
  }
}
