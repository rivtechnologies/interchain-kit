<script setup lang="ts">
import { ref, provide } from 'vue'
import Modal from './modal.vue'

// defineProps<{ msg: string }>()

const modalRef = ref(null);
const openModal = () => modalRef.value.open();
const closeModal = () => {
  modalRef.value.close()
};

provide('openModal', openModal);
provide('closeModal', closeModal);

</script>

<template>
  <div>
    <slot></slot>
    <Modal ref="modalRef" />
  </div>
</template>

<style scoped>

</style>
