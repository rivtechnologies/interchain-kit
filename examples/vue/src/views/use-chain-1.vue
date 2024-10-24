<script setup lang="ts">
import { ref } from 'vue'
import { useChain } from '@interchain-kit/vue';

const chainName = ref('osmosistestnet')
const { chain, assetList, address, wallet, queryClient, signingClient } = useChain(chainName)
const balance = ref('0')

const getBalance = async() => {
  const {balance: bc} =  await queryClient.value.balance({
    address: address.value,
    denom: 'uosmo',
  })
  balance.value = bc?.amount || '0'
}
</script>

<template>
  <div>
		<div>chain: {{ chain.prettyName }}</div>
		<div>assetList: {{ assetList?.assets?.length }}</div>
		<div>address: {{ address }}</div>
		<div>wallet: {{ wallet?.option?.prettyName }}</div>
    <div>balance: {{ balance }}</div> <button @click="getBalance">getBalance</button>
  </div>
</template>

<style scoped>
</style>
