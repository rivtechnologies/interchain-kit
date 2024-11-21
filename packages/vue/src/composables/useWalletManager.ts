import { WalletManager } from '@interchain-kit/core';
import { inject, Reactive } from 'vue';

import { WALLET_MANAGER_KEY } from '../utils';

export const useWalletManager = (): Reactive<WalletManager> => {
  const wm = inject<Reactive<WalletManager>>(WALLET_MANAGER_KEY)
  if (!wm) {
    console.error(`walletManager is undefined, did you foget to set ChainProvider?
    <ChainProvider
      :wallets="[keplrWallet, leapWallet, ...]"
      :chains="[osmosisChain, junoChain, ...]"
      :asset-lists="[osmosisAssetList, junoAssetList, ...]"
      :signer-options="{}"
      :endpoint-options="{}"
    >
      <router-view>
    </ChainProvider>`);
    return undefined
  }
  return wm;
};