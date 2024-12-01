<script setup lang="ts">
import { ref } from 'vue'
import { useChain } from '@interchain-kit/vue';
import { ibc } from 'osmojs'
import { toEncoders, toConverters } from '@interchainjs/cosmos/utils';


const chainName = ref("cosmoshub")
const { rpcEndpoint, signingClient } = useChain(chainName)

const transferMsg = ibc.applications.transfer.v1.MessageComposer.withTypeUrl.transfer({
  sourcePort: "transfer",
  sourceChannel: 'channel-141',
  token: {
      denom: "uatom",
      amount: '18000',
  },
  sender: 'cosmos18gttzdr3v5lwwda8kep9xeuxep7g78ywxzg35r',
  receiver: 'osmo18gttzdr3v5lwwda8kep9xeuxep7g78ywwempz3',
  // @ts-ignore
  timeoutTimestamp: (Date.now() + 5 * 60 * 1000) * 1e6, 
});

const fee = {
  amount: [{ denom: "uatom", amount: "5000" }],
  gas: "200000", // Gas limit
};

const handleTransfer = async() => {
  signingClient.value.addEncoders(toEncoders(ibc.applications.transfer.v1.MsgTransfer))
  signingClient.value.addConverters(toConverters(ibc.applications.transfer.v1.MsgTransfer))

  const result = await signingClient.value.signAndBroadcast('cosmos18gttzdr3v5lwwda8kep9xeuxep7g78ywxzg35r', [transferMsg], fee);
  console.log("Transaction result:", result);
}
</script>

<template>
  <div>
    {{ rpcEndpoint }}
    <button @click="handleTransfer">click to transfer</button>
  </div>
</template>

<style scoped>
</style>
