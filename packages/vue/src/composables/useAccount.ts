import { WalletAccount, WalletState } from "@interchain-kit/core"
import { onMounted, ref, Ref } from "vue"
import { useWalletManager } from "./useWalletManager"

export const useAccount = (chainName: string, walletName: string): Ref<WalletAccount | null> => {
	let account = ref<WalletAccount | null>(null)
	const walletManager = useWalletManager()

	const wallet = walletManager.wallets.find(w => w.option.name === walletName)
	const chain = walletManager.chains.find(c => c.chainName === chainName);

	const getAccount = async () => {
		if (wallet && chain) {
			if (wallet.walletState === WalletState.Connected) {
				const act = await wallet.getAccount(chain.chainId) as WalletAccount
				account.value = act
			}
			if (wallet.walletState === WalletState.Disconnected) {
				account.value = null
			}
		}
		if (!wallet) {
			account.value = null
		}
	}

	getAccount()
	// onMounted(() => {
	//     console.log('onMounted', wallet)
	//     if (wallet) {
	//         wallet.events.on('keystoreChange', getAccount);
	//     }
	// })
	return account
}