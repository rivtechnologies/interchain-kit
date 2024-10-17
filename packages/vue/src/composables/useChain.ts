import { useWalletManager } from './useWalletManager';
import { AssetList, Chain } from "@chain-registry/v2-types";
import { getChainLogoUrl } from "../utils";
import { inject, watch, computed } from 'vue'
import { useCurrentWallet } from './useCurrentWallet';
import { useAccount } from './useAccount';
import { OPEN_MODAL_KEY, CLOSE_MODAL_KEY } from '../utils';
import { CosmosKitUseChainReturnType, UseChainReturnType } from '../types/chain';
import { useInterchainClient } from './useInterchainClient';

export const useChain = (chainName: string): UseChainReturnType & CosmosKitUseChainReturnType => {
  const walletManager = useWalletManager();
  const chainToShow = walletManager.chains.find((c: Chain) => c.chainName === chainName);
  const assetList = walletManager.assetLists.find((a: AssetList) => a.chainName === chainName);

  const open = inject<() => void>(OPEN_MODAL_KEY);
  const close = inject<() => void>(CLOSE_MODAL_KEY);
  const currentWallet = useCurrentWallet()
  const account = useAccount(chainName, currentWallet?.option?.name)
  const interchainClient = useInterchainClient(chainName, currentWallet?.option?.name)

  const getRpcEndpoint = async () => {
    return await walletManager.getRpcEndpoint(currentWallet, chainName);
  }

  const disconnect = () => {
    walletManager.disconnect(currentWallet?.option?.name)
  }

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
    username: computed(() => account.value?.username),
    message: currentWallet?.errorMessage,
    getSigningCosmWasmClient: () => walletManager.getSigningCosmwasmClient(currentWallet.option.name, chainName),
    getSigningCosmosClient: () => walletManager.getSigningCosmosClient(currentWallet.option.name, chainName),
  }

  const useChainReturnType: UseChainReturnType = {
    logoUrl: getChainLogoUrl(assetList),
    chain: chainToShow,
    assetList,
    address: computed(() => account.value?.address),
    wallet: currentWallet,
    ...interchainClient
  }

  return {
    ...cosmosKitUserChainReturnType,
    ...useChainReturnType
  };
};