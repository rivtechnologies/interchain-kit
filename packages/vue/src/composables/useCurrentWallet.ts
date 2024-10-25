
import { ref, watch } from 'vue';

import { useWalletManager } from './useWalletManager';

export const useCurrentWallet = () => {
	const walletManager = useWalletManager();
	const currentWallet = ref();

	watch(walletManager, () => {
		currentWallet.value = walletManager.getCurrentWallet();
		console.log('[walletManager changed]', currentWallet.value?.option?.name, currentWallet.value?.walletState);
	});
	currentWallet.value = walletManager.getCurrentWallet();

	return currentWallet;
};