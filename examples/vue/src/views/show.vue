<script setup lang="ts">
import { ref } from 'vue'
import { useChain } from '@interchain-kit/vue';

const chainName = ref('osmosistestnet')
const { address } = useChain(chainName);
</script>

<template>
  <div>
    <div>address: {{ address }}</div>
  </div>
</template>

<style scoped>
</style>
