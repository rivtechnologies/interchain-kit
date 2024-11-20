import { ChainNameNotExist, WalletAccount, WalletState } from '@interchain-kit/core';
import { computed, Ref, ref, watch } from 'vue';

import { useWalletManager } from './useWalletManager';
import { onMounted } from 'vue';

export const useAccount = (chainName: Ref<string>, walletName: Ref<string>): Ref<WalletAccount | null> => {
  let account = ref<WalletAccount | null>(null);
  const walletManager = useWalletManager();

  const wallet = computed(() => {
    return walletManager.wallets.find(w => w.info.name === walletName.value);
  })

  const chain = computed(() => {
    return walletManager.chains.find(c => c.chainName === chainName.value);
  })

  const getAccount = async () => {
    if (!chain.value) {
      console.error(`[useAccount] error: the chain ${chainName.value} was not found, please check if it was registered in ChainProvider`);
      throw new ChainNameNotExist(chainName.value);
    }
    if (wallet.value && chain.value) {
      if (wallet.value.walletState === WalletState.Connected) {
        const act = await wallet.value.getAccount(chain.value.chainId) as WalletAccount;
        account.value = act;
      }
      if (wallet.value.walletState === WalletState.Disconnected) {
        account.value = null;
      }
    }
    if (!wallet.value) {
      account.value = null;
    }
  };

  watch([wallet, chain, walletManager], getAccount);
  watch(wallet, (newWt, oldWt) => {
    if (newWt) {
      oldWt?.events.off('accountChanged', getAccount)
      newWt?.events.on('accountChanged', getAccount)
    }
  })
  getAccount();

  onMounted(() => {
    wallet.value?.events.on('accountChanged', getAccount)
  })

  return account;
};