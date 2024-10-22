import { useWalletManager } from "./useWalletManager"
import { CosmosKitUseChainReturnType, UseChainReturnType } from '../types/chain';
import { useAccount } from "./useAccount";
import { AssetList, Chain } from "@chain-registry/v2-types";
import { useCurrentWallet } from './useCurrentWallet';
import { useInterchainClient } from './useInterchainClient';
import { useWalletModal } from "../modal";
import { ChainNameNotExist } from "@interchain-kit/core";
import { useCallback } from "react";


export const useChain = (chainName: string): UseChainReturnType => {
  const walletManager = useWalletManager()
  const chainToShow = walletManager.chains.find((c: Chain) => c.chainName === chainName)
  const assetList = walletManager.assetLists.find((a: AssetList) => a.chainName === chainName)

  const currentWallet = useCurrentWallet()
  const account = useAccount(chainName, currentWallet?.option?.name)
  const interchainClient = useInterchainClient(chainName, currentWallet?.option?.name)

  if (!chainToShow) {
    throw new ChainNameNotExist(chainName)
  }

  const { open, close } = useWalletModal()

  const getRpcEndpoint = useCallback(async () => {
    return await walletManager.getRpcEndpoint(currentWallet, chainName);
  }, [walletManager, currentWallet, chainName]);

  const disconnect = useCallback(() => {
    walletManager.disconnect(currentWallet?.option?.name);
  }, [walletManager, currentWallet]);

  const cosmosKitUserChainReturnType: CosmosKitUseChainReturnType = {
    connect: () => {
      if (currentWallet) {
        return
      }
      open()
    },
    disconnect,
    openView: open,
    closeView: close,
    getRpcEndpoint,
    status: currentWallet?.walletState,
    username: account?.username,
    message: currentWallet?.errorMessage
  }

  return {
    logoUrl: walletManager.getChainLogoUrl(chainName),
    chain: chainToShow,
    assetList,
    address: account?.address,
    wallet: currentWallet,
    ...cosmosKitUserChainReturnType, //for migration cosmos kit
    ...interchainClient
  }
}