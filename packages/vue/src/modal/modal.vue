<!-- Modal.vue -->
<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <ul class="modal">
      <li v-for="(wallet, i) in wallets" @click="walletClick(wallet)">
        {{ wallet.prettyName }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWalletManager } from '../composables'

const visible = ref(false);
const wallets = ref({
})

const walletManager = useWalletManager();

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

const open = () => {
  visible.value = true;
};

const close = () => {
  visible.value = false;
};

const walletClick = (wallet: any) => {
  console.log('wallet.name', wallet.name)
  walletManager.connect(wallet.name)
}

defineExpose({
  open,
  close
})

</script>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 5px;
}
</style>
