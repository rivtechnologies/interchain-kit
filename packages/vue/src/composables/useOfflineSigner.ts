import { OfflineSigner } from '@interchainjs/cosmos/types/wallet';
import { Ref, ref, watch } from 'vue';

import { useWalletManager } from './useWalletManager';

export const useOfflineSigner = (chainName: Ref<string>, walletName: Ref<string>) => {
  const walletManager = useWalletManager();
  const offlineSigner = ref<OfflineSigner>();

  const _setValues = () => {
    const wallet = walletManager.wallets.find((w) => w.info.name === walletName.value);

    offlineSigner.value = walletManager.getOfflineSigner(wallet, chainName.value);
  };
  watch([chainName, walletName, walletManager], _setValues);
  _setValues();

  return offlineSigner;
};