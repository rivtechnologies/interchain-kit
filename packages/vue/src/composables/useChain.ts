import { useWalletManager } from './useWalletManager';
import { AssetList, Chain } from "@chain-registry/v2-types";
import { getChainLogoUrl } from "../utils";
import { inject, computed, Ref, ref, watch } from 'vue'
import { useCurrentWallet } from './useCurrentWallet';
import { useAccount } from './useAccount';
import { OPEN_MODAL_KEY, CLOSE_MODAL_KEY } from '../utils';
import { CosmosKitUseChainReturnType, UseChainReturnType } from '../types/chain';
import { useInterchainClient } from './useInterchainClient';

export const useChain = (chainName: Ref<string>): UseChainReturnType & CosmosKitUseChainReturnType => {
  console.log('useChain', chainName.value)
  const walletManager = useWalletManager();
  const chainToShow = ref()
  const assetList = ref()
  const getRpcEndpoint = ref()
  const getSigningCosmWasmClient = ref()
  const getSigningCosmosClient = ref()
  const currentWallet = useCurrentWallet()
  const walletName = ref(currentWallet?.option?.name)
  const interchainClient = useInterchainClient(chainName, walletName)
  const logoUrl = ref('')
  const account = useAccount(chainName, walletName)

  const setPropertiesByChainName = () => {
    chainToShow.value = walletManager.chains.find((c: Chain) => c.chainName === chainName.value);
    assetList.value = walletManager.assetLists.find((a: AssetList) => a.chainName === chainName.value)

    getRpcEndpoint.value = async () => {
      return await walletManager.getRpcEndpoint(currentWallet, chainName.value);
    }
    getSigningCosmWasmClient.value = () => walletManager.getSigningCosmwasmClient(currentWallet.option.name, chainName.value)
    getSigningCosmosClient.value = () => walletManager.getSigningCosmosClient(currentWallet.option.name, chainName.value)
  }

  watch(chainName, () => {
    setPropertiesByChainName()
  })

  watch(assetList, () => {
    logoUrl.value = getChainLogoUrl(assetList.value)
  })
  setPropertiesByChainName()
  logoUrl.value = getChainLogoUrl(assetList.value)

  const open = inject<() => void>(OPEN_MODAL_KEY);
  const close = inject<() => void>(CLOSE_MODAL_KEY);

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
    getSigningCosmWasmClient,
    getSigningCosmosClient,
  }

  watch(account, (newAcc) => {
    console.log('newAcc', newAcc)
  })

  const useChainReturnType: UseChainReturnType = {
    logoUrl,
    chain: chainToShow,
    assetList,
    address: computed(() => account.value?.address),
    wallet: currentWallet,
    ...interchainClient,
  }

  return {
    ...cosmosKitUserChainReturnType,
    ...useChainReturnType
  };
};