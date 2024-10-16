<script setup lang="ts">
import { ref, provide, defineProps } from 'vue'
import { Modal } from './modal'
import { AssetList, Chain } from "@chain-registry/v2-types";
import {
  BaseWallet,
  SignerOptions,
  WalletManager,
  EndpointOptions,
} from "@interchain-kit/core";
import { WALLET_MANAGER_KEY, OPEN_MODAL_KEY, CLOSE_MODAL_KEY } from './utils/index'

type InterchainWalletProviderProps = {
  chains: Chain[];
  assetLists: AssetList[];
  wallets: BaseWallet[];
  signerOptions: SignerOptions;
  endpointOptions: EndpointOptions;
};

const forceRenderKey = ref<number>(0);

const props = defineProps<InterchainWalletProviderProps>();

const modalRef = ref(null);
const openModal = () => {
  modalRef.value.open();
}
const closeModal = () => {
  modalRef.value.close()
};

// injected globally
provide(OPEN_MODAL_KEY, openModal);
provide(CLOSE_MODAL_KEY, closeModal);

const { chains, assetLists, wallets, signerOptions, endpointOptions } = props;

const walletManager = new WalletManager(
  chains,
  assetLists,
  wallets,
  signerOptions,
  endpointOptions,
  () => {
    forceRenderKey.value += 1
  }
);
walletManager.init();

// injected globally
provide(WALLET_MANAGER_KEY, walletManager)

</script>

<template>
  <div>
    <slot :key="forceRenderKey"></slot>
    <Modal ref="modalRef" />
  </div>
</template>

<style scoped>

</style>
