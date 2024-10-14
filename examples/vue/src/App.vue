<script setup lang="ts">
import { useChain } from '@interchain-kit/vue';
// const {logoUrl, address, status, username, wallet, openView, getRpcEndpoint, disconnect } = useChain('osmosis');
const { connect, wallet } = useChain('osmosis');

console.log('wallet', wallet)
</script>

<template>
  <div>
    this is app.vue
    <button @click="connect">connect</button>
  </div>
</template>

<style scoped>

</style>
