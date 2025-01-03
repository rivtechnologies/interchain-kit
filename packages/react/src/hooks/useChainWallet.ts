import { useWalletManager } from "./useWalletManager"
import { useAccount } from "./useAccount"
import { UseChainWalletReturnType } from "../types/chain"
import { useInterchainClient } from "./useInterchainClient"
import { useRpcEndpoint } from "./useRpcEndpoint"

export const useChainWallet = (chainName: string, walletName: string): UseChainWalletReturnType => {
  const walletManager = useWalletManager()

  const walletRepository = walletManager.getWalletRepositoryByName(walletName)
  const chainAccount = walletRepository.getChainAccountByName(chainName)

  const rpcEndpointHook = useRpcEndpoint(chainName, walletName)
  const accountHook = useAccount(chainName, walletName)
  const signingClientHook = useInterchainClient(chainName, walletName)

  return {
    connect: () => chainAccount.connect(),
    disconnect: () => chainAccount.disconnect(),
    getRpcEndpoint: () => chainAccount.getRpcEndpoint(),
    status: chainAccount.walletState,
    username: accountHook.account?.username,
    message: chainAccount.errorMessage,
    logoUrl: walletManager.getChainLogoUrl(chainName),
    rpcEndpoint: rpcEndpointHook.rpcEndpoint,
    chain: chainAccount.chain,
    assetList: chainAccount.assetList,
    address: accountHook.account?.address,
    wallet: walletRepository,
    signingClient: signingClientHook.signingClient,
    getSigningClient: () => signingClientHook.getSigningClient(),
    isRpcEndpointLoading: rpcEndpointHook.isLoading,
    isAccountLoading: accountHook.isLoading,
    isSigningClientLoading: signingClientHook.isLoading,
    isLoading: rpcEndpointHook.isLoading || accountHook.isLoading || signingClientHook.isLoading,
    getRpcEndpointError: rpcEndpointHook.error,
    getSigningClientError: signingClientHook.error,
    getAccountError: accountHook.error
  }
}