
import { ref, watch } from 'vue';

import { BaseWallet } from '@interchain-kit/core';
import { useWalletManager } from './useWalletManager';

export const useCurrentWallet = () => {
	const walletManager = useWalletManager();
	const currentWallet = ref<BaseWallet>();

	watch(walletManager, () => {
		currentWallet.value = walletManager.getCurrentWallet();
		console.log('[walletManager changed]', currentWallet.value?.info?.name, currentWallet.value?.walletState);
	});
	currentWallet.value = walletManager.getCurrentWallet();

	return currentWallet;
};