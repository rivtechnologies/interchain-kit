<script setup lang="ts">
import { ref, inject } from 'vue'
import { useChain, OPEN_MODAL_KEY } from '@interchain-kit/vue';
const chainName = ref('juno')
const { address, wallet, logoUrl, connect, disconnect } = useChain(chainName);
const open = inject<() => void>(OPEN_MODAL_KEY);
</script>

<template>
  <div>
    <button @click="open">open wallets modal</button>
    <p>{{wallet?.walletState}}</p>
    <p>{{wallet?.info?.prettyName}}</p>

    <p>{{address}}</p>
    <img :src="wallet?.info?.logo?.toString()" :style="{ width: '100px' }" />
    <img :src="logoUrl" :style="{ width: '100px' }"></img>
    <button @click="connect">Connect</button>
    <button @click="disconnect">Disconnect</button>
  </div>
</template>

<style scoped>
</style>
