<script setup lang="ts">
import { useWalletManager, useChain } from '@interchain-kit/vue'
// import HelloWorld from './components/HelloWorld.vue'

const walletManager = useWalletManager();
console.log('wal', walletManager, useChain);

// const {logoUrl, address, status, username, wallet, openView, getRpcEndpoint, disconnect } = useChain('osmosis');
// console.log(logoUrl)

</script>

<template>
  <div>
    ss
  </div>
</template>

<style scoped>

</style>
