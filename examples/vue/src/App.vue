<script setup lang="ts">
import { ref, watch } from 'vue'
import { useChain } from '@interchain-kit/vue';
import { coins } from "@cosmjs/amino";
const chainName = ref('osmosistestnet')
const { 
  logoUrl, openView, disconnect, wallet, address, 
  status, username, message, chain, getSigningCosmosClient, rpcEndpoint,
  queryClient
} = useChain(chainName.value);
const recipientAddress = ref('')
const amount = ref('')
const isSending = ref(false)
const balance = ref('0')
console.log('wallet', wallet)

watch(queryClient, async(client) => {
  if (client) {
    const {balance: bc} =  await queryClient.value.balance({
      address: address.value,
      denom: chain.staking?.stakingTokens[0].denom as string,
    })
    if (bc?.amount) {
      balance.value = bc.amount
    }
  }
})

const handleSendToken = async() => {
  console.log(amount.value, recipientAddress.value)
  const denom = chain.staking?.stakingTokens[0].denom as string;

  const fee = {
    amount: coins(25000, denom),
    gas: "1000000",
  };

  try {
    isSending.value = true
    let signingCosmosClient = await getSigningCosmosClient()
    const tx = await signingCosmosClient.helpers.send(
      address.value,
      {
        fromAddress: address.value,
        toAddress: recipientAddress.value,
        amount: [
          { denom, amount: amount.value },
        ],
      },
      fee,
      "test"
    );
    console.log('tx', tx);
    alert('Transaction was successful!')
    amount.value = ''
  } catch (error) {
    console.error(error);
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <div>
    <select
      :v-model="chainName"
      className="h-9 px-3 mr-4 border rounded-md shadow-sm"
    >
      <option value="osmosistestnet">Osmosis Testnet</option>
      <option value="juno">Juno</option>
      <option value="osmosis">Osmosis</option>
      <option value="stargaze">Stargaze</option>
      <option value="cosmoshub">Cosmos Hub</option>
    </select>
    logo: <img :src="logoUrl" alt="" style="width: 30px;" />
    <div>rpcEndpoint: {{ rpcEndpoint }}</div>
    <div>address: {{ address }}</div>
    <div>balance: {{ balance }}</div>
    <div>walletStatus: {{ status  }}</div>
    <div>username: {{ username }}</div>
    <div>message: {{ message }}</div>
    <button @click="openView">connect</button>
    <button @click="disconnect">disconnect</button>
    <div>
      <div>amount: <input v-model="amount" type="text" /></div>
      <div>recipient address: <input v-model="recipientAddress" type="text" style="width: 400px;" /></div>
      <button @click="handleSendToken" :disabled="!recipientAddress && !amount">send</button>
    </div>
  </div>
</template>

<style scoped>

</style>
