import { WalletState } from '@interchain-kit/core';
import { HttpEndpoint } from '@interchainjs/types';
import { SigningClient } from '../types';
import { Ref, ref, watch, computed } from 'vue';

import { useWalletManager } from './useWalletManager';
import { onMounted } from 'vue';

export function useInterchainClient(chainName: Ref<string>, walletName: Ref<string>) {
	const rpcEndpoint = ref<string | HttpEndpoint>('');
	const signingClient = ref<SigningClient>();
	const error = ref<string | unknown | null>(null);
	const isLoading = ref(false);

	const walletManager = useWalletManager();

	const wallet = computed(() => {
		return walletManager.wallets.find(w => w.info.name === walletName.value);
	})

	const initialize = async () => {
		if (wallet.value && wallet.value?.walletState === WalletState.Connected) {
			try {
				isLoading.value = true;
				rpcEndpoint.value = await walletManager.getRpcEndpoint(wallet.value, chainName.value);
				signingClient.value = await walletManager.getSigningClient(walletName.value, chainName.value);
			} catch (err) {
				error.value = err;
				console.log('create client error', err);
			} finally {
				isLoading.value = false;
			}
		}
	};

	watch([chainName, wallet, walletManager], initialize);
	watch(wallet, (newWt, oldWt) => {
		if (newWt) {
			oldWt?.events.off('keystoreChange', initialize)
			newWt?.events.on('keystoreChange', initialize)
		}
	})
	initialize();

	onMounted(() => {
		wallet.value?.events.on('keystoreChange', initialize)
	})

	return {
		rpcEndpoint,
		signingClient,
		isLoading,
		error,
	};
}