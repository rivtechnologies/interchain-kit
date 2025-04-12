
import { useAsync } from "./useAsync"
import { useWalletManager } from "./useWalletManager"

export const useRpcEndpoint = (chainName: string, walletName: string) => {
  const { getRpcEndpoint, updateChainWalletState, wallets } = useWalletManager()

  const { data, error, isLoading } = useAsync({
    queryKey: `rpc-endpoint-${chainName}`,
    queryFn: async () => {
      const rpc = await getRpcEndpoint(walletName, chainName)
      wallets.forEach(wallet => {
        updateChainWalletState(wallet.info.name, chainName, {
          rpcEndpoint: rpc
        })
      })
      return rpc
    }
  })

  return {
    rpcEndpoint: data,
    error,
    isLoading
  }

}