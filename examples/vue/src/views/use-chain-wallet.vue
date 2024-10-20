<script setup lang="ts">
import { ref, watch } from 'vue'
import { useChainWallet } from '@interchain-kit/vue';
import { coins } from "@cosmjs/amino";

const chainName = ref('osmosistestnet')
const walletName = ref('keplr-extension')
const { 
  logoUrl, wallet, address, chain, rpcEndpoint,
  queryClient,
	signingCosmosClient
} = useChainWallet(chainName, walletName);

const recipientAddress = ref('')
const amount = ref('')
const isSending = ref(false)
const balance = ref('0')

watch(queryClient, async(client) => {
  if (client) {
    const {balance: bc} =  await queryClient.value.balance({
      address: address.value,
      denom: chain.value.staking?.stakingTokens[0].denom as string,
    })
    console.log('bc', bc)
    if (bc?.amount) {
      balance.value = bc.amount
    } else {
      balance.value = '0'
    }
  }
})

const handleSendToken = async() => {
  const denom = chain.value.staking?.stakingTokens[0].denom as string;

  const fee = {
    amount: coins(25000, denom),
    gas: "1000000",
  };

  try {
    isSending.value = true
    const tx = await signingCosmosClient.value?.helpers.send(
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
      v-model="chainName"
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
    <div>walletStatus: {{ wallet?.walletState  }}</div>
    <div>
      <div>amount: <input v-model="amount" type="text" /></div>
      <div>recipient address: <input v-model="recipientAddress" type="text" style="width: 400px;" /></div>
      <button @click="handleSendToken" :disabled="!recipientAddress && !amount">send</button>
    </div>
  </div>
</template>

<style scoped>

</style>
