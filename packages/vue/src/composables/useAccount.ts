import { WalletAccount, WalletState, WalletManagerState } from "@interchain-kit/core"
import { onMounted, ref, Ref, watch } from "vue"
import { useWalletManager } from "./useWalletManager"

export const useAccount = (chainName: Ref<string>, walletName: Ref<string>): Ref<WalletAccount | null> => {
	let account = ref<WalletAccount | null>(null)
	const walletManager = useWalletManager()

	const getAccount = async () => {
		const wallet = walletManager.wallets.find(w => w.option.name === walletName.value)
		const chain = walletManager.chains.find(c => c.chainName === chainName.value);
		if (!chain) {
			console.error(`[useAccount] error: the chain ${chainName.value} was not found, please check if it was registered in ChainProvider`)
		}
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

	onMounted(() => {
		walletManager.wallets.forEach(wallet => {
			wallet.events.on('keystoreChange', getAccount)
		})
	})

	watch([chainName, walletName, walletManager], getAccount)
	getAccount()

	return account
}