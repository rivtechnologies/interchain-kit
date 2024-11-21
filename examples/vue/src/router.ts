import { createRouter, createWebHistory } from 'vue-router'
import UseChain from './views/use-chain.vue'
import UseChainWallet from './views/use-chain-wallet.vue'
import UseOfflineSigner from './views/useOfflineSigner.vue'
import UseConfig from './views/use-config.vue'
import ActiveWallet from './views/active-wallet.vue'
import WalletConnect from './views/wallet-connect.vue'

const routes = [
	{ path: '/', name: 'index', component: UseChain },
	{ path: '/use-chain', name: 'useChain', component: UseChain },
	{ path: '/use-chain-wallet', name: 'useChainWallet', component: UseChainWallet },
	{ path: '/use-offline-signer', name: 'useOfflineSigner', component: UseOfflineSigner },
	{ path: '/use-config', name: 'useConfig', component: UseConfig },
	{ path: '/active-wallet', name: 'activeWallet', component: ActiveWallet },
	{ path: '/wallet-connect', name: 'walletConnect', component: WalletConnect }
]

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes
})

export default router