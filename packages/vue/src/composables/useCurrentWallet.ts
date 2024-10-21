
import { useWalletManager } from "./useWalletManager"
import { ref, watch } from 'vue'

export const useCurrentWallet = () => {
	const walletManager = useWalletManager()
	const currentWallet = ref()

	watch(walletManager, () => {
		currentWallet.value = walletManager.getCurrentWallet()
		console.log('walletManager changed', currentWallet.value.walletState)
	})
	currentWallet.value = walletManager.getCurrentWallet()

	return currentWallet
}