import { createRouter, createWebHistory } from 'vue-router'
import UseChain from './views/use-chain.vue'
import UseChainWallet from './views/use-chain-wallet.vue'

const routes = [
	{ path: '/', name: 'index', component: UseChain },
	{ path: '/use-chain', name: 'useChain', component: UseChain },
	{ path: '/use-chain-wallet', name: 'useChainWallet', component: UseChainWallet }
]

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes
})

export default router