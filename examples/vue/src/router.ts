import { createRouter, createWebHistory } from 'vue-router'
import UseChain from './views/use-chain.vue'
import UseChain1 from './views/use-chain-1.vue'
import UseChainWallet from './views/use-chain-wallet.vue'
import UseChainWallet1 from './views/use-chain-wallet-1.vue'
import UseOfflineSigner from './views/useOfflineSigner.vue'

const routes = [
	{ path: '/', name: 'index', component: UseChain },
	{ path: '/use-chain', name: 'useChain', component: UseChain },
	{ path: '/use-chain-1', name: 'useChain1', component: UseChain1 },
	{ path: '/use-chain-wallet', name: 'useChainWallet', component: UseChainWallet },
	{ path: '/use-chain-wallet-1', name: 'useChainWallet1', component: UseChainWallet1 },
	{ path: '/use-offline-signer', name: 'useOfflineSigner', component: UseOfflineSigner }
]

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes
})

export default router