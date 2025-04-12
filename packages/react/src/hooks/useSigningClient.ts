import { useWalletManager } from "./useWalletManager"
import { useRpcEndpoint } from "./useRpcEndpoint"
import { useAsync } from "./useAsync"
import { WalletState } from "@interchain-kit/core"

export const useSigningClient = (chainName: string, walletName: string) => {
  const { getSigningClient, getChainWalletState, getWalletByName } = useWalletManager()
  const { rpcEndpoint } = useRpcEndpoint(chainName, walletName)

  const chainWalletState = getChainWalletState(walletName, chainName)

  const wallet = getWalletByName(walletName)

  const { data, isLoading, error } = useAsync({
    queryKey: `signing-client-${chainName}-${walletName}`,
    queryFn: () => getSigningClient(walletName, chainName),
    enabled: !!rpcEndpoint && chainWalletState?.walletState === WalletState.Connected
  })

  return {
    signingClient: data,
    error,
    isLoading,
  }
}
