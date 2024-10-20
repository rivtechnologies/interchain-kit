<script setup lang="ts">
import { ref } from 'vue'
import { useChainWallet, useWalletManager } from '@interchain-kit/vue';

const junoChainName = ref('juno')
const keplrWalletName = ref('keplr-extension')
const juno = useChainWallet(junoChainName, keplrWalletName);

const stargazeChainName = ref('stargaze')
const leapWalletName = ref('leap-extension')
const stargaze = useChainWallet(stargazeChainName, leapWalletName);

const walletManager = useWalletManager()
	
const connectKeplr = async() => {
	await walletManager.connect('keplr-extension')
}
const connectLeap = async() => {
	await walletManager.connect('leap-extension')
}
</script>

<template>
  <div>
		<button @click="connectKeplr">connect keplr</button>
		<button @click="connectLeap">connect leap</button>
    <div>juno address: {{ juno.address }}</div>
		<div>stargaze address: {{ stargaze.address }}</div>
  </div>
</template>

<style scoped>
</style>
