import { AssetList, Chain } from '@chain-registry/v2-types';
import { computed,Ref, ref, watch } from 'vue';

import { UseChainReturnType } from '../types/chain';
import { useAccount } from './useAccount';
import { useCurrentWallet } from './useCurrentWallet';
import { useInterchainClient } from './useInterchainClient';
import { useWalletManager } from './useWalletManager';

export const useChainWallet = (chainName: Ref<string>, walletName: Ref<string>): UseChainReturnType => {
  const logoUrl = ref('');
  const walletManager = useWalletManager();
  const currentWallet = useCurrentWallet();
  const chainToShow = ref();
  const assetList = ref();
  const account = useAccount(chainName, walletName);
  const interchainClient = useInterchainClient(chainName, walletName);

  const _setValues = () => {
    logoUrl.value = walletManager.getChainLogoUrl(chainName.value);
    chainToShow.value = walletManager.chains.find((c: Chain) => c.chainName === chainName.value);
    assetList.value = walletManager.assetLists.find((a: AssetList) => a.chainName === chainName.value);
  };

  watch([chainName, walletName, walletManager], _setValues);
  _setValues();

  return {
    logoUrl,
    chain: chainToShow,
    assetList,
    address: computed(() => account.value?.address),
    wallet: currentWallet,
    ...interchainClient,
  };
};