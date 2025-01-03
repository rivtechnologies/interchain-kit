import { useEffect } from "react"
import { useWalletManager } from "./useWalletManager"
import { WalletState } from "@interchain-kit/core"

export const useRpcEndpoint = (chainName: string, walletName: string) => {
  const walletManager = useWalletManager()

  const chainAccount = walletManager.getWalletRepositoryByName(walletName)?.getChainAccountByName(chainName)

  useEffect(() => {
    if (chainAccount?.walletState === WalletState.Connected) {
      chainAccount.getRpcEndpoint()
    }
  }, [chainName, walletName, chainAccount?.walletState])

  if (chainAccount && chainAccount.walletState === WalletState.Connected) {
    return {
      rpcEndpoint: chainAccount?.rpcEndpoint,
      isLoading: chainAccount?.getRpcEndpointState().loading,
      error: chainAccount?.getRpcEndpointState().error,
      getRpcEndpoint: () => chainAccount?.getRpcEndpoint()
    }
  }

  return {
    rpcEndpoint: undefined,
    isLoading: false,
    error: undefined,
    getRpcEndpoint: () => chainAccount?.getRpcEndpoint()
  }
}