import { useEffect, useState } from "react"
import { useWalletManager } from "./useWalletManager"
import { WalletState } from "@interchain-kit/core"
import { useRpcEndpoint } from "./useRpcEndpoint"

export const useSigningClient = (chainName: string, walletName: string) => {
  const { getSigningClient, getChainWalletState } = useWalletManager()
  const { rpcEndpoint } = useRpcEndpoint(chainName, walletName)
  const [signingClient, setSigningClient] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Use useMemo to ensure chainWalletState is stable
  const chainWalletState = getChainWalletState(walletName, chainName)

  useEffect(() => {
    if (
      chainWalletState?.walletState === WalletState.Connected &&
      rpcEndpoint
    ) {
      const handleGetSigningClient = async () => {
        setIsLoading(true)
        try {
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
  }, [chainWalletState?.walletState, rpcEndpoint])

  return {
    signingClient,
    error,
    isLoading,
  }
}
