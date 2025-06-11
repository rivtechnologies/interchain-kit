import { AssetList, Chain } from '@chain-registry/types';
import { ChainNameNotExist, WalletState } from '@interchain-kit/core';
import { computed, inject, Ref, ref, watch } from 'vue';
import { CosmosKitUseChainReturnType, UseChainReturnType } from '../types/chain';
import { CLOSE_MODAL_KEY, OPEN_MODAL_KEY } from '../utils';
import { useAccount } from './useAccount';
import { useCurrentWallet } from './useCurrentWallet';
import { useInterchainClient } from './useInterchainClient';
import { useWalletManager } from './useWalletManager';

export const useChain = (chainName: Ref<string>): UseChainReturnType => {
  const walletManager = useWalletManager();
  const chainToShow = ref<Chain>();
  const assetList = ref<AssetList>();
  const getRpcEndpoint = ref();
  const currentWallet = useCurrentWallet();
  const walletName = computed<string>(() => currentWallet.value?.info?.name);
  const interchainClient = useInterchainClient(chainName, walletName);
  const logoUrl = ref<string>('');
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
  };

  watch([chainName, walletManager], () => {
    _setValuesByChainName();
  });
  _setValuesByChainName();

  const open = inject<() => void>(OPEN_MODAL_KEY);
  const close = inject<() => void>(CLOSE_MODAL_KEY);

  const disconnect = computed(() => {
    return () => {
      walletManager.disconnect(currentWallet.value?.info?.name);
    }
  });

  const cosmosKitUserChainReturnType: CosmosKitUseChainReturnType = {
    connect: computed(() => {
      return () => {
        if (currentWallet.value?.walletState === WalletState.Connected) {
          return;
        }
        open();
      }
    }),
    disconnect,
    openView: open,
    closeView: close,
    getRpcEndpoint,
    status: computed(() => currentWallet.value?.walletState),
    username: computed(() => account.value?.username),
    message: computed(() => currentWallet.value?.errorMessage),
  };

  return {
    logoUrl,
    chain: chainToShow,
    assetList,
    address: computed(() => account.value?.address),
    wallet: currentWallet,
    ...interchainClient,
    ...cosmosKitUserChainReturnType,
  };
};