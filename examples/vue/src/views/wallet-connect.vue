<script setup lang="ts">
import { useWalletManager } from '@interchain-kit/vue';
import { BaseWallet, WCWallet } from '@interchain-kit/core';
import VueQrcode from '@chenfengyuan/vue-qrcode';
import { ref } from 'vue';

const uri = ref('')
const walletManager = useWalletManager()
const getCode = async() => {
  const chainIds = walletManager.chains.map(c => c.chainId)
  const currentWallet = walletManager.wallets.find((w: BaseWallet) => w.info?.name === 'WalletConnect')
  // await currentWallet?.connect(chainIds as string[])
  // await walletManager.connect('WalletConnect')
  console.log((currentWallet as WCWallet).pairingUri)
  uri.value = (currentWallet as WCWallet).pairingUri || "";
}

const disconnect = () => {

}
</script>

<template>
  <div>
    <button @click="getCode">connect</button>
    <button @click="disconnect">disconnect</button>
    <vue-qrcode v-if="uri" :value="uri" :options="{ width: 200 }"></vue-qrcode>
  </div>
</template>

<style scoped>
</style>
