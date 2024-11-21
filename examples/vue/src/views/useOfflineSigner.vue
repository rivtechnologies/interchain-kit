<script setup lang="ts">
import { ref } from 'vue'
import { useOfflineSigner } from '@interchain-kit/vue'

const chainName = ref('cosmoshub')
const walletName = ref('keplr-extension')
const offlineSigner = useOfflineSigner(chainName, walletName)

console.log(offlineSigner.value) // cosmoshub offlineSigner in keplr-extension wallet 
</script>
<template>
	<div></div>
</template>
<style scoped>
</style>