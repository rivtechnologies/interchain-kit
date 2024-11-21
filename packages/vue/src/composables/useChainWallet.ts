import { AssetList, Chain } from '@chain-registry/v2-types';
import { computed, Ref, ref, watch } from 'vue';

import { UseChainWalletReturnType } from '../types/chain';
import { useAccount } from './useAccount';
import { useCurrentWallet } from './useCurrentWallet';
import { useInterchainClient } from './useInterchainClient';
import { useWalletManager } from './useWalletManager';
import { BaseWallet } from '@interchain-kit/core';

export const useChainWallet = (chainName: Ref<string>, walletName: Ref<string>): UseChainWalletReturnType => {
  const logoUrl = ref('');
  const walletManager = useWalletManager();
  const chainToShow = ref();
  const assetList = ref();
  const account = useAccount(chainName, walletName);
  const interchainClient = useInterchainClient(chainName, walletName);
  const getRpcEndpoint = ref()

  const wallet = computed(() => {
    return walletManager.wallets.find((w: BaseWallet) => w.info.name === walletName.value)
  })

  const _setValues = () => {
    logoUrl.value = walletManager.getChainLogoUrl(chainName.value);
    chainToShow.value = walletManager.chains.find((c: Chain) => c.chainName === chainName.value);
    assetList.value = walletManager.assetLists.find((a: AssetList) => a.chainName === chainName.value);
    getRpcEndpoint.value = async () => {
      await walletManager.getRpcEndpoint(wallet.value, walletName.value)
    }
  };

  const connect = computed(() => {
    return () => walletManager.connect(walletName.value)
  })
  const disconnect = computed(() => {
    return () => walletManager.disconnect(walletName.value)
  })

  watch([chainName, walletName, walletManager], _setValues);
  _setValues();

  return {
    connect,
    disconnect,
    getRpcEndpoint,
    status: computed(() => wallet.value?.walletState),
    username: computed(() => account.value?.username),
    message: computed(() => wallet.value?.errorMessage),
    logoUrl,
    chain: chainToShow,
    assetList,
    address: computed(() => account.value?.address),
    wallet,
    ...interchainClient,
  };
};