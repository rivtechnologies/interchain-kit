import { useWalletManager } from "./useWalletManager"
import { CosmosKitUseChainReturnType, UseChainReturnType } from '../types/chain';
import { useAccount } from "./useAccount";
import { AssetList, Chain } from "@chain-registry/v2-types";
import { useActiveWallet } from './useActiveWallet';
import { useInterchainClient } from './useInterchainClient';
import { useWalletModal } from "../modal";
import { ChainNameNotExist } from "@interChain-kit/core";

export const useChain = (chainName: string): UseChainReturnType & CosmosKitUseChainReturnType => {
  const walletManager = useWalletManager()
  const chainToShow = walletManager.chains.find((c: Chain) => c.chainName === chainName)
  const assetList = walletManager.assetLists.find((a: AssetList) => a.chainName === chainName)

  const activeWallet = useActiveWallet()
  const account = useAccount(chainName, activeWallet?.option?.name)
  const interchainClient = useInterchainClient(chainName, activeWallet?.option?.name)

  if (!chainToShow) {
    throw new ChainNameNotExist(chainName)
  }

  const { open, close } = useWalletModal()

  const cosmosKitUserChainReturnType: CosmosKitUseChainReturnType = {
    connect: () => {
      if (activeWallet) {
        return
      }
      open()
    },
    openView: open,
    closeView: close,
    getRpcEndpoint: () => walletManager.getRpcEndpoint(activeWallet, chainName),
    status: activeWallet?.walletState,
    username: account?.username,
    message: activeWallet?.errorMessage,
    getSigningCosmWasmClient: () => walletManager.createClientFactory(activeWallet, chainName).then((c) => c.getSigningCosmwasmClient()),
    getSigningStargateClient: () => walletManager.createClientFactory(activeWallet, chainName).then((c) => c.getSigningStargateClient())
  }

  return {
    chain: chainToShow,
    assetList,
    address: account?.address,
    wallet: activeWallet,
    ...cosmosKitUserChainReturnType, //for migration cosmos kit
    ...interchainClient
  }
}