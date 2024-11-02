<script setup lang="ts">
import { watch } from 'vue'
import { useConfig, useWalletManager } from '@interchain-kit/vue';
import { chain as stargazeChain, assetList as stargazeAssetList } from "@chain-registry/v2/mainnet/stargaze";

const { updateChains, updateAssetLists } = useConfig()
const walletManager = useWalletManager()

const { chains, assetLists } = walletManager

watch(walletManager, (wm) => {
  console.log('wm>', wm)
})

const handleUpdate = () => {
  updateChains([stargazeChain, ...chains])
  updateAssetLists([stargazeAssetList, ...assetLists])
}
</script>

<template>
  <div>
    <button @click="handleUpdate">update config</button>
  </div>
</template>

<style scoped>
</style>
