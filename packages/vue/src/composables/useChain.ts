import { AssetList, Chain } from '@chain-registry/v2-types';
import { ChainNameNotExist, WalletState } from '@interchain-kit/core';
import { computed, inject, Ref, ref, watch } from 'vue';

import { CosmosKitUseChainReturnType, UseChainReturnType } from '../types/chain';
import { CLOSE_MODAL_KEY, OPEN_MODAL_KEY } from '../utils';
import { useAccount } from './useAccount';
import { useCurrentWallet } from './useCurrentWallet';
import { useInterchainClient } from './useInterchainClient';
import { useWalletManager } from './useWalletManager';

export const useChain = (chainName: Ref<string>): UseChainReturnType & CosmosKitUseChainReturnType => {
  const walletManager = useWalletManager();
  const chainToShow = ref();
  const assetList = ref();
  const getRpcEndpoint = ref();
  const getSigningCosmWasmClient = ref();
  const getSigningCosmosClient = ref();
  const currentWallet = useCurrentWallet();
  const walletName = computed(() => currentWallet.value?.option?.name);
  const interchainClient = useInterchainClient(chainName, walletName);
  const logoUrl = ref('');
  const account = useAccount(chainName, walletName);
  const _setValuesByChainName = () => {
    chainToShow.value = walletManager.chains.find((c: Chain) => c.chainName === chainName.value);
    if (!chainToShow.value) {
      throw new ChainNameNotExist(chainName.value);
    }
    assetList.value = walletManager.assetLists.find((a: AssetList) => a.chainName === chainName.value);
    logoUrl.value = walletManager.getChainLogoUrl(chainName.value);
    getRpcEndpoint.value = async () => {
      return await walletManager.getRpcEndpoint(currentWallet.value, chainName.value);
    };
    getSigningCosmWasmClient.value = () => walletManager.getSigningCosmwasmClient(currentWallet.value.option.name, chainName.value);
    getSigningCosmosClient.value = () => walletManager.getSigningCosmosClient(currentWallet.value.option.name, chainName.value);
  };

  watch([chainName, walletManager], () => {
    _setValuesByChainName();
  });
  _setValuesByChainName();

  const open = inject<() => void>(OPEN_MODAL_KEY);
  const close = inject<() => void>(CLOSE_MODAL_KEY);

  const disconnect = () => {
    walletManager.disconnect(currentWallet.value?.option?.name);
  };

  const cosmosKitUserChainReturnType: CosmosKitUseChainReturnType = {
    connect: () => {
      if (currentWallet.value?.walletState === WalletState.Connected) {
        return;
      }
      open();
    },
    disconnect,
    openView: open,
    closeView: close,
    getRpcEndpoint,
    status: computed(() => currentWallet.value?.walletState),
    username: computed(() => account.value?.username),
    message: computed(() => currentWallet.value?.errorMessage),
    getSigningCosmWasmClient,
    getSigningCosmosClient,
  };

  const useChainReturnType: UseChainReturnType = {
    logoUrl,
    chain: chainToShow,
    assetList,
    address: computed(() => account.value?.address),
    wallet: currentWallet,
    ...interchainClient,
  };

  return {
    ...cosmosKitUserChainReturnType,
    ...useChainReturnType
  };
};