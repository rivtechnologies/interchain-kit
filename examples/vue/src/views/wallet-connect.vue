<script setup lang="ts">
import { useAccount, useWalletManager } from '@interchain-kit/vue';
import { BaseWallet, WCWallet } from '@interchain-kit/core';
import VueQrcode from '@chenfengyuan/vue-qrcode';
import { ref, computed, watch } from 'vue';

const walletManager = useWalletManager()
const chainName = ref('osmosis')
const currentWallet = ref<WCWallet>(walletManager.wallets.find((w: BaseWallet) => w.info?.name === 'WalletConnect') as WCWallet)
const walletName = computed(() => {
  return currentWallet.value?.info?.name || ''
})
watch(walletManager, (wm: any) => {
  currentWallet.value = wm.wallets.find((w: BaseWallet) => w.info?.name === 'WalletConnect')
})
const account = useAccount(chainName, walletName)
const connect = async() => {
  await walletManager.connect('WalletConnect')
}

const disconnect = async() => {
  await walletManager.disconnect('WalletConnect')
}
</script>

<template>
  <div>
    address: {{ account?.address }}
    <button @click="connect">connect</button>
    <button @click="disconnect">disconnect</button>
    <vue-qrcode v-if="currentWallet?.pairingUri" :value="currentWallet?.pairingUri" :options="{ width: 200 }"></vue-qrcode>
  </div>
</template>

<style scoped>
</style>
