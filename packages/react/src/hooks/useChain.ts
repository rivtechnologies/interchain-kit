import { useWalletManager } from "./useWalletManager"
import { CosmosKitUseChainReturnType, UseChainReturnType } from '../types/chain';
import { useAccount } from "./useAccount";
import { useCurrentWallet } from './useCurrentWallet';
import { useInterchainClient } from './useInterchainClient';
import { useWalletModal } from "../modal";
import { useRpcEndpoint } from "./useRpcEndpoint";
import { WalletState } from "@interchain-kit/core";
import { useCurrentChainWallet } from "./useCurrentChainWallet";

export const useChain = (chainName: string): UseChainReturnType => {
  const walletManager = useWalletManager()
  const chainAccount = useCurrentChainWallet()

  const walletName = chainAccount?.info?.name

  const rpcEndpointHook = useRpcEndpoint(chainName, walletName)
  const accountHook = useAccount(chainName, walletName)
  const signingClientHook = useInterchainClient(chainName, walletName)

  const { open, close } = useWalletModal()

  const cosmosKitUserChainReturnType: CosmosKitUseChainReturnType = {
    connect: () => {
      if (chainAccount?.walletState === WalletState.Connected) {
        return
      }
      walletManager.currentChainName = chainName
      open()
    },
    disconnect: () => {
      walletManager.currentChainName = chainName
      chainAccount ?? chainAccount.disconnect()
    },
    openView: () => {
      walletManager.currentChainName = chainName
      open()
    },
    closeView: close,
    getRpcEndpoint: () => chainAccount.getRpcEndpoint(),
    status: chainAccount?.walletState,
    username: accountHook.account?.username,
    message: chainAccount?.errorMessage
  }

  if (chainAccount && chainAccount?.walletState === WalletState.Connected) {
    return {
      logoUrl: walletManager.getChainLogoUrl(chainName),
      chain: chainAccount?.chain,
      assetList: chainAccount?.assetList,
      address: accountHook.account?.address,
      wallet: chainAccount,
      rpcEndpoint: rpcEndpointHook.rpcEndpoint,
      ...cosmosKitUserChainReturnType, //for migration cosmos kit
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
  return {
    logoUrl: walletManager.getChainLogoUrl(chainName),
    chain: chainAccount?.chain,
    assetList: chainAccount?.assetList,
    address: accountHook.account?.address,
    wallet: chainAccount,
    rpcEndpoint: rpcEndpointHook.rpcEndpoint,
    ...cosmosKitUserChainReturnType, //for migration cosmos kit
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