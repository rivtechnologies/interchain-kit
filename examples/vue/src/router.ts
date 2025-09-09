import { createRouter, createWebHistory } from 'vue-router';

import ActiveWallet from './views/active-wallet.vue';
import IbcTransfer from './views/ibc-transfer.vue';
import UseChain from './views/use-chain.vue';
import UseChainWallet from './views/use-chain-wallet.vue';
import UseConfig from './views/use-config.vue';
import UseOfflineSigner from './views/useOfflineSigner.vue';
import WalletConnect from './views/wallet-connect.vue';

const routes = [
  { path: '/', name: 'index', component: UseChain },
  { path: '/use-chain', name: 'useChain', component: UseChain },
  { path: '/use-chain-wallet', name: 'useChainWallet', component: UseChainWallet },
  { path: '/use-offline-signer', name: 'useOfflineSigner', component: UseOfflineSigner },
  { path: '/use-config', name: 'useConfig', component: UseConfig },
  { path: '/active-wallet', name: 'activeWallet', component: ActiveWallet },
  { path: '/wallet-connect', name: 'walletConnect', component: WalletConnect },
  { path: '/ibc-transfer', name: 'ibcTransfer', component: IbcTransfer }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;