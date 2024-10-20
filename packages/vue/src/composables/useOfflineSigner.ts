import { OfflineSigner } from '@interchainjs/cosmos/types/wallet';
import { useWalletManager } from "./useWalletManager"
import { Ref, ref, watch } from 'vue'

export const useOfflineSigner = (chainName: Ref<string>, walletName: Ref<string>) => {
	const walletManager = useWalletManager()
	const offlineSigner = ref<OfflineSigner>()

	const _setValues = () => {
		const wallet = walletManager.wallets.find((w) => w.option.name === walletName.value)

		offlineSigner.value = walletManager.getOfflineSigner(wallet, chainName.value)
	}
	watch([chainName, walletName], _setValues)
	_setValues()

	return offlineSigner
}