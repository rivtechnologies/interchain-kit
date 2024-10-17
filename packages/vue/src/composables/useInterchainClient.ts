import { HttpEndpoint } from '@interchainjs/types'
import { CosmWasmSigningClient } from 'interchainjs/cosmwasm'
import { CosmosSigningClient } from 'interchainjs/cosmos'
import { SigningClient } from 'interchainjs/signing-client'
import { RpcQuery } from 'interchainjs/query/rpc'
import { ref, watch, Ref, computed } from 'vue'
import { useWalletManager } from './useWalletManager'
import { Chain } from '@chain-registry/v2-types'
import { useAccount } from './useAccount'
import { WalletState } from '@interchain-kit/core'
import { InjSigningClient } from '@interchainjs/injective/signing-client'

export function useInterchainClient(chainName: string, walletName: string) {
	const rpcEndpoint = ref<string | HttpEndpoint | undefined>()
	const queryClient = ref<RpcQuery | null>(null)
	const signingClient = ref<SigningClient | null>(null)
	const signingCosmosClient = ref<CosmosSigningClient | null>()
	const signingCosmWasmClient = ref<CosmWasmSigningClient | null>()
	const signingInjectiveClient = ref<InjSigningClient | null>()
	const error = ref<string | unknown | null>(null)
	const isLoading = ref(false)

	const walletManager = useWalletManager()
	// const account = useAccount(chainName, walletName)

	const initialize = async () => {
		const wallet = walletManager.wallets.find((w) => w.option.name === walletName)
		const chainToShow = walletManager.chains.find((c: Chain) => c.chainName === chainName)

		if (wallet && chainToShow && wallet?.walletState === WalletState.Connected) {
			try {
				isLoading.value = true

				rpcEndpoint.value = await walletManager.getRpcEndpoint(wallet, chainName)
				queryClient.value = await walletManager.getQueryClient(walletName, chainName)
				signingClient.value = await walletManager.getSigningClient(walletName, chainName)
				signingCosmosClient.value = await walletManager.getSigningCosmosClient(walletName, chainName)
				signingCosmWasmClient.value = await walletManager.getSigningCosmwasmClient(walletName, chainName)
				signingInjectiveClient.value = await walletManager.getSigningInjectiveClient(walletName, chainName)

			} catch (err) {
				error.value = err
				console.log("create client error", err)
			} finally {
				isLoading.value = false
			}
		}
	}

	// watch([chainName, walletName, account], initialize)
	initialize()

	return {
		rpcEndpoint,
		queryClient,
		signingClient: chainName === 'injective' ? signingInjectiveClient : signingInjectiveClient,
		signingCosmosClient,
		signingCosmWasmClient,
		signingInjectiveClient,
		isLoading,
		error,
	}
}