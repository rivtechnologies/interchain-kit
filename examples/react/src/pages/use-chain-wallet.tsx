import { useEffect, useState } from 'react'
import { useChain, useChainWallet } from '@interchain-kit/react'
import { Button } from '@interchain-ui/react';
import { coins } from "@cosmjs/amino";

const UseChainWallet = () => {
  const [chainName, setChainName] = useState("osmosistestnet");
  const { chain, logoUrl, address, status, wallet, openView, disconnect } = useChain(chainName);
  const [balance, setBalance] = useState<string | undefined>("");
  const { queryClient, isLoading, signingCosmosClient } = useChainWallet(chainName, wallet?.option?.name as string);
  const [recipientAddress, setRecipientAddress] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [isSending, setIsSending] = useState<boolean>(false)

  const clickDisconnect = () => {
    disconnect()
  }

  useEffect(() => {
    if (queryClient && chain && address) {
      const query = async() => {
        const {balance} =  await queryClient.balance({
          address,
          denom: chain.staking?.stakingTokens[0].denom as string,
        })
        setBalance(balance?.amount);
      }
      query()
    }
  }, [queryClient, chain, address]);

  const onRecipientAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientAddress(e.target.value)
  }

  const onAmountChange = (e: React.ChangeEvent<HTMLInputElement>)  => {
    setAmount(e.target.value)
  }

  const handleSendToken = async() => {
    const denom = chain.staking?.stakingTokens[0].denom as string;

    const fee = {
      amount: coins(25000, denom),
      gas: "1000000",
    };

    try {
      console.log({
        fromAddress: address,
        toAddress: recipientAddress,
        amount: [
          { denom, amount },
        ],
      },
      fee)
      setIsSending(true)
      const tx = await signingCosmosClient.helpers.send(
        address,
        {
          fromAddress: address,
          toAddress: recipientAddress,
          amount: [
            { denom, amount },
          ],
        },
        fee,
        "test"
      );
      console.log('tx', tx);
      alert('Transaction was successful!')
      setAmount('')
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false)
    }
  }
  // console.log('wallet', wallet)

  return (
    <div className="space-y-4 mx-auto max-w-3xl mt-20">
      <h1 className="text-2xl font-semibold">useChainWallet usage:</h1>
      <select
        value={chainName}
        onChange={(e) => setChainName(e.target.value)}
        className="h-9 px-3 mr-4 border rounded-md shadow-sm"
      >
        <option value="juno">Juno</option>
        <option value="osmosistestnet">Osmosis Testnet</option>
        <option value="osmosis">Osmosis</option>
        <option value="stargaze">Stargaze</option>
        <option value="cosmoshub">Cosmos Hub</option>
      </select>
      <div className="flex items-center">
        <span className="font-bold">logo:</span> <img className="w-[20px] h-[20px]" src={logoUrl} alt="logoUrl" />
      </div>
      <div>
        <span className="font-bold">current wallet: </span>{wallet?.option?.prettyName}
      </div>
      <div>
        <span className="font-bold">wallet status: </span>
        { status === 'Connected' ? <span className="text-green-900">Connected</span> : status}
        { status === 'Connected' ? (
            <span className="text-red-600 underline cursor-pointer ml-5" onClick={clickDisconnect}>disconnect</span>
          ) : (
            <span className="text-blue-600 underline cursor-pointer ml-5" onClick={openView}>connect</span>
          ) 
        }
      </div>
      <div className="flex items-center">
        <span className="font-bold">account address: </span>{ address }
      </div>
      <div className="flex items-center">
        <span className="font-bold">balance: </span>{ balance }
      </div>
      <div className="flex items-center">
        <span className="font-bold">send tokens to(recipient account address): <input value={recipientAddress} onChange={onRecipientAddressChange} className="border p-2 rounded w-full" type="text" /> </span>
      </div>
      <div className="flex items-center">
        <span className="font-bold">amount: <input value={amount} onChange={onAmountChange} className="border p-2 rounded" type="text" /> </span>
      </div>
      <div className="flex items-center justify-center" onClick={handleSendToken}>
        <Button disabled={!recipientAddress} isLoading={isSending}>Send</Button>
      </div>
    </div>
  )
}
export default UseChainWallet