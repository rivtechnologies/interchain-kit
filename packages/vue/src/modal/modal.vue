<!-- Modal.vue -->
<template>
  <Modal :is-open="visible" @close="close">
    <ConnectModalHead
      :title="title"
      :hasCloseButton="true"
      :hasBackButton="hasBack"
      @back="_reset"
      :closeButtonProps="closeButtonProps"
    />
    <!----<ConnectModalQrcode v-if="hasBack" v-bind="qrCodeProps" />-->
    <ConnectModalWalletList
      v-if="connectStatus === WalletState.Disconnected"
      :wallets="wallets"
      @wallet-item-click="walletClick"
    />
    <ConnectModalStatus 
      v-else
      :wallet="{
        name: connectingWallet.info?.name,
        prettyName: connectingWallet.info?.prettyName,
        logo: connectingWallet.info?.logo as string,
        mobileDisable: true
      }"
      :connected-info="connectedInfo"
      :status="connectStatus"
      :content-header="contentHeader"
      :content-desc="contentDesc"
      @connect="walletClick(connectingWallet)"
      @disconnect="disconnect(connectingWallet)"
    />
  </Modal>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useWalletManager } from '../composables'
import { WalletState, WalletAccount } from '@interchain-kit/core';
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

const qrCodeProps = {
  status: "Done",
  link: "wc:43529f434fbce35ebc8df08786f70e78f652b7ad45ba1834e5914d8b0dd1e96d@2?relay-protocol=irn&symKey=056b788f4ba347fa65ed0cad68baae3bca1bb5c22d3efc225c7af9e08ad9ddd2",
  description: "Open Keplr Mobile App to Scan",
  onRefresh: "ƒ onRefresh() {}",
  qrCodeSize: 230,
};

const visible = ref(false);
const wallets = ref({
})
const connectStatus = ref(WalletState.Disconnected)
// Connecting
const connectingWallet = ref<any>(null)
// Rejected
const errorMessage = ref('')
// Connected
const account = ref()

const walletManager = useWalletManager();

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
  if (connectStatus.value === WalletState.Disconnected) {
    return 'Select your wallet'
  } else if (
    [WalletState.Connecting, WalletState.Rejected, WalletState.Connected].includes(connectStatus.value)
    && connectingWallet.value) {
    return connectingWallet.value.info?.prettyName
  }
})
const contentHeader = computed(() => {
  if (connectStatus.value === WalletState.Connecting) {
    return 'Requesting Connection'
  } else if (connectStatus.value === WalletState.Rejected) {
    return 'Request Rejected'
  }
})
const contentDesc = computed(() => {
  if (connectStatus.value === WalletState.Connecting) {
    return `Open the ${connectingWallet.value?.info?.prettyName} browser extension to connect your wallet.`
  } else if (connectStatus.value === WalletState.Rejected) {
    return errorMessage.value || 'Connection permission is denied.'
  }
})
const hasBack = computed(() => {
  return connectStatus.value !== WalletState.Disconnected
})

const connectedInfo = computed(() => {
  if (account.value) {
    return  {
      avatar : "https://picsum.photos/500",
      name : account.value.username,
      address : account.value.address
    }
  }
  return {}
})

const setAccount = async() => {
  if (connectStatus.value === WalletState.Connected && connectingWallet.value) {
    const chain = walletManager.chains[0]
    const act = await connectingWallet.value.getAccount(chain.chainId) as WalletAccount
    console.log('act', act)
    account.value = act
  }
}

const open = () => {
  visible.value = true;
};

const close = () => {
  visible.value = false;
  // reset
  _reset()
};

const closeButtonProps = {
  onClick: close
}

const walletClick = async(wallet: any) => {
  connectStatus.value = WalletState.Connecting
  connectingWallet.value = wallet
  try {
    await walletManager.connect(wallet?.info.name)
    close()
    // connectStatus.value = WalletState.Connected
    // errorMessage.value = ''
    // setAccount()
  } catch(e: any) {
    connectStatus.value = WalletState.Rejected
    console.error('[wallet connecting error]', e.message)
    errorMessage.value = e.message
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

const _reset = () => {
  connectStatus.value = WalletState.Disconnected
  connectingWallet.value = null
}

defineExpose({
  open,
  close
})
</script>

<style>
</style>
