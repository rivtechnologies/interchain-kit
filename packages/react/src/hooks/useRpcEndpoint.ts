import { useEffect } from "react"
import { useWalletManager } from "./useWalletManager"
import { WalletState } from "@interchain-kit/core"

export const useRpcEndpoint = (chainName: string, walletName: string) => {
  const walletManager = useWalletManager()

  const chainAccount = walletManager.getWalletRepositoryByName(walletName)?.getChainAccountByName(chainName)

  useEffect(() => {
    if (chainAccount?.walletState === WalletState.Connected && !chainAccount.rpcEndpoint && chainName && walletName) {
      chainAccount.getRpcEndpoint()
    }
  }, [chainAccount?.walletState, walletName, chainName])

  return {
    rpcEndpoint: chainAccount?.rpcEndpoint,
    isLoading: chainAccount?.getRpcEndpointState().loading,
    error: chainAccount?.getRpcEndpointState().error,
    getRpcEndpoint: chainAccount?.getRpcEndpoint
  }
}