import './style.css';

import { assetLists, chains } from '@chain-registry/v2';
import { BaseWallet, WCWallet } from '@interchain-kit/core';
import { keplrWallet } from '@interchain-kit/keplr-extension';
import { leapWallet } from '@interchain-kit/leap-extension';
import { walletManagerPlugin } from '@interchain-kit/vue';
import { createApp } from 'vue';

import App from './App.vue';

const app = createApp(App);

const _wallets: BaseWallet[] = [
  keplrWallet,
  leapWallet,
];

const chainNames = ['osmosis', 'juno', 'cosmoshub', 'stargaze', 'noble'];
const _chains = chains.filter((c) => chainNames.includes(c.chainName));
const _assetLists = assetLists.filter((a) => chainNames.includes(a.chainName));

app.use(walletManagerPlugin, {
  wallets: _wallets,
  chains: _chains,
  assetLists: _assetLists,
  signerOptions: {},
  endpointOptions: {
    endpoints: {
    }
  }
});
app.mount('#app');
