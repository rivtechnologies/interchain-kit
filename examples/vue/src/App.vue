<script setup lang="ts">
import { ChainProvider } from '@interchain-kit/vue'
import { keplrWallet } from '@interchain-kit/keplr-extension';
import { leapWallet } from '@interchain-kit/leap-extension';
import { RouterView } from 'vue-router';
import { chain as junoChain, assetList as junoAssetList } from "@chain-registry/v2/mainnet/juno";
import { chain as osmosisChain,assetList as osmosisAssetList } from "@chain-registry/v2/mainnet/osmosis";
import { chain as cosmoshubChain, assetList as cosmoshubAssetList } from "@chain-registry/v2/mainnet/cosmoshub";
import { chain as osmosisTestChain, assetList as osmosisTestAssetList } from "@chain-registry/v2/testnet/osmosistestnet"
</script>

<template>
  <ChainProvider
    :wallets="[keplrWallet, leapWallet]"
    :chains="[osmosisChain, junoChain, cosmoshubChain, osmosisTestChain]"
    :asset-lists="[osmosisAssetList, junoAssetList, cosmoshubAssetList, osmosisTestAssetList]"
    :signer-options="{}"
    :endpoint-options="{}"
  >
    <router-view />
  </ChainProvider>
</template>

<style scoped>
</style>
