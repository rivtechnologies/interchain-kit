<!-- Modal.vue -->
<template>
  <Modal :is-open="visible" @close="close">
    <ConnectModalHead
      :title="title"
      :hasCloseButton="true"
      :hasBackButton="hasBack"
      @back="isList=true"
      :closeButtonProps="closeButtonProps"
    />
    <ConnectModalWalletList
      v-if="isList"
      :wallets="wallets"
      @wallet-item-click="walletClick"
    />
    <ConnectModalQrcode 
      v-else-if="currentWallet?.info?.mode === 'wallet-connect'" 
      :status="currentWallet?.pairingUri ? 'Done' : 'Pending'"
      :link="currentWallet?.pairingUri"
      description="Open App to connect"
      @onRefresh="onRefresh"
      qrCodeSize="230"
    />
    <ConnectModalStatus 
      v-else
      :wallet="{
        name: currentWallet.info?.name,
        prettyName: currentWallet.info?.prettyName,
        logo: currentWallet.info?.logo as string,
        mobileDisable: true
      }"
      :connected-info="{}"
      :status="currentWallet?.walletState"
      :content-header="contentHeader"
      :content-desc="contentDesc"
      @connect="walletClick(currentWallet)"
      @disconnect="disconnect(currentWallet)"
    />
  </Modal>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, Ref } from 'vue'
import { useCurrentWallet, useWalletManager } from '../composables'
import { BaseWallet, WalletState, WCWallet, } from '@interchain-kit/core';
import {
  Box,
  Modal,
  Button,
  ConnectModalQrcode,
  ConnectModal,
  ConnectModalHead,
  ConnectModalWalletList,
  ConnectModalStatus
} from "@interchain-ui/vue";

const visible = ref(false);
const wallets = ref({
})
const isList = ref(true)
// Rejected
const errorMessage = ref('')
const walletManager = useWalletManager();
const currentWallet = useCurrentWallet() as Ref<WCWallet>;
const onRefresh = () => walletManager.connect(currentWallet.value?.info?.name)

onMounted(() => {
  const res = walletManager.wallets.map((w) => {
    return ({
      name: w.info.name,
      prettyName: w.info.prettyName,
      logo: w.info.logo as string,
      mobileDisabled: true,
      shape: 'list' as 'list',
      originalWallet: w
    })
  })
  wallets.value = res
})

const title = computed(() => {
  if (!currentWallet.value) {
    return 'Select your wallet'
  } else if (
    [WalletState.Connecting, WalletState.Rejected, WalletState.Connected, WalletState.Disconnected].includes(currentWallet.value?.walletState)) {
    return currentWallet.value?.info?.prettyName
  }
})
const contentHeader = computed(() => {
  if (currentWallet.value?.walletState === WalletState.Connecting) {
    return 'Requesting Connection'
  } else if (currentWallet.value?.walletState === WalletState.Rejected) {
    return 'Request Rejected'
  }
})
const contentDesc = computed(() => {
  if (currentWallet.value?.walletState === WalletState.Connecting) {
    return `Open the ${currentWallet.value?.info?.prettyName} browser extension to connect your wallet.`
  } else if (currentWallet.value?.walletState === WalletState.Rejected) {
    return errorMessage.value || 'Connection permission is denied.'
  }
})
const hasBack = computed(() => {
  return !isList.value
})

const open = () => {
  visible.value = true;
};

const close = () => {
  visible.value = false;
  // reset
  isList.value = true
};

const closeButtonProps = {
  onClick: close
}

watch(walletManager, (wm) => {
  
});

const walletClick = async(wallet: any) => {
  isList.value = false
  try {
    await walletManager.connect(wallet?.info.name)
    close()
  } catch(e: any) {
    console.error('[wallet connecting error]', e.message)
  }
}

const disconnect = async(wallet: any) => {
  try {
    await walletManager.disconnect(wallet?.info?.name as string);
    close()
  } catch(e: any) {
    console.log('[wallet disconnecting error]', e.message)
  }
}

defineExpose({
  open,
  close
})
</script>

<style>
</style>
