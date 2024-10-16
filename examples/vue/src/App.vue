<script setup lang="ts">
import { useChain } from '@interchain-kit/vue';
// const {logoUrl, address, status, username, wallet, openView, getRpcEndpoint, disconnect } = useChain('osmosis');
const chain = useChain('osmosis');
const { logoUrl, connect, disconnect, wallet, account } = chain;

console.log('chain', chain)
console.log('wallet', wallet)
</script>

<template>
  <div>
    logo: <img :src="logoUrl" alt="" style="width: 30px;" />
    address: {{ account?.address }}
    <button @click="connect">connect</button>
    <button @click="disconnect">disconnect</button>
  </div>
</template>

<style scoped>

</style>
