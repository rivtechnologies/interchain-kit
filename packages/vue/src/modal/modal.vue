<!-- Modal.vue -->
<template>
  <div v-if="visible" @click.self="close">
    <Modal :is-open="true" @close="">
      <ConnectModalHead
        :title="title"
        :hasCloseButton="true"
        :hasBackButton="hasBack"
        @back="onBack"
        @close="close"
      />
      <!----<ConnectModalQrcode v-if="hasBack" v-bind="qrCodeProps" />-->
      <ConnectModalWalletList
        v-if="!isConnecting"
        :wallets="wallets"
        @wallet-item-click="walletClick"
      />
      <ConnectModalStatus 
        v-else
        :wallet="{
          name: connectingWallet.option?.name,
          prettyName: connectingWallet.option?.prettyName,
          logo: connectingWallet.option?.logo as string,
          mobileDisable: true
        }"
        :status="'Connecting'"
        :content-header="'Requesting Connection'"
        :content-desc="contentDesc"
      />
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useWalletManager } from '../composables'
import {
  Box,
  Modal,
  Button,
  ConnectModalQrcode,
  ConnectModalHead,
  ConnectModalWalletList,
  ConnectModalStatus
} from "@interchain-ui/vue";

const qrCodeProps = {
  status: "Done",
  link: "wc:43529f434fbce35ebc8df08786f70e78f652b7ad45ba1834e5914d8b0dd1e96d@2?relay-protocol=irn&symKey=056b788f4ba347fa65ed0cad68baae3bca1bb5c22d3efc225c7af9e08ad9ddd2",
  description: "Open Keplr Mobile App to Scan",
  onRefresh: "ƒ onRefresh() {}",
  qrCodeSize: 230,
};

const hasBack = ref(false)
const visible = ref(false);
const wallets = ref({
})
const isConnecting = ref(false)
const connectingWallet = ref<any>({})

const walletManager = useWalletManager();

watch(walletManager, (wm) => {
  console.log('change!!')
})

onMounted(() => {
  const res = walletManager.wallets.map((w) => {
    return ({
      name: w.option.name,
      prettyName: w.option.prettyName,
      logo: w.option.logo as string,
      mobileDisabled: true,
      shape: 'list' as 'list',
      originalWallet: w
    })
  })
  wallets.value = res
})

const title = computed(() => {
  let titleStr = 'Select your wallet'
  if (isConnecting) {
    titleStr = 'Requesting Connection'
  }
  return titleStr
})
const contentDesc = computed(() => {
  return `Open the ${connectingWallet.value?.option?.prettyName} browser extension to connect your wallet.`
})

const open = () => {
  visible.value = true;
};

const close = () => {
  visible.value = false;
};

const walletClick = async(wallet: any) => {
  isConnecting.value = true
  connectingWallet.value = wallet
  await walletManager.connect(wallet?.option.name)
  close()
}

const onBack = () => {
  hasBack.value = false
}
const onNext = () => {
  hasBack.value = true
}

defineExpose({
  open,
  close
})
</script>

<style>
</style>
