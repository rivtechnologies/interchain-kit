import { createRouter, createWebHistory } from 'vue-router'
import UseChain from './views/use-chain.vue'
import UseChainWallet1 from './views/use-chain-wallet.vue'
import UseOfflineSigner from './views/useOfflineSigner.vue'
import UseConfig from './views/use-config.vue'
import WalletConnect from './views/wallet-connect.vue'

const routes = [
	{ path: '/', name: 'index', component: UseChain },
	{ path: '/use-chain', name: 'useChain', component: UseChain },
	{ path: '/use-chain-wallet-1', name: 'useChainWallet1', component: UseChainWallet1 },
	{ path: '/use-offline-signer', name: 'useOfflineSigner', component: UseOfflineSigner },
	{ path: '/use-config', name: 'useConfig', component: UseConfig },
	{ path: '/use-wallet', name: 'walletConnect', component: WalletConnect }
]

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes
})

export default router