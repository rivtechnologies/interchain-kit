<script setup lang="ts">
import { ref, inject } from 'vue'
const openModal = inject<() => void>('openModal');
const closeModal = inject<() => void>('closeModal');
const testfn = inject('testfn')

defineProps<{ msg: string }>()

const clickMe = () => {
  console.log(openModal, testfn)
}


</script>

<template>
  <h1 @click="clickMe">Click me {{ msg }}</h1>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
