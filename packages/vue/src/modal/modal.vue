<script setup lang="ts">
import { ConnectModal } from '@interchain-ui/vue';
import { ref } from 'vue'

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template>
  <ConnectModal>
    as
  </ConnectModal>
</template>

<style scoped>

</style>
