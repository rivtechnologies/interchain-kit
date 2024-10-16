<script setup lang="ts">
import { ChainProvider } from '@interchain-kit/vue'
import App from './App.vue'
import { assetLists, chains } from '@chain-registry/v2';
import { BaseWallet, WCWallet } from '@interchain-kit/core';
import { keplrWallet } from '@interchain-kit/keplr-extension';
import { leapWallet } from '@interchain-kit/leap-extension';

const _wallets: BaseWallet[] = [
  keplrWallet,
  leapWallet,
];

const chainNames = ['osmosis', 'juno', 'cosmoshub', 'stargaze', 'noble'];
const _chains = chains.filter((c) => chainNames.includes(c.chainName));
const _assetLists = assetLists.filter((a) => chainNames.includes(a.chainName));

</script>

<template>
  <ChainProvider
    :wallets="_wallets"
    :chains="_chains"
    :asset-lists="_assetLists"
    :signer-options="{}"
    :endpoint-options="{
      endpoints: {}
    }"
  >
    <App />
  </ChainProvider>
</template>

<style scoped>

</style>
