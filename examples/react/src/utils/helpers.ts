
import { SigningClient } from '@interchain-kit/react';
import { createCosmosQueryClient } from '@interchainjs/cosmos';
import { getBalance as getBalanceQuery, MsgSend, send } from 'interchainjs';

export const sendToken = async (
  fromAddress: string,
  toAddress: string,
  amount: string,
  denom: string,
  signingClient: SigningClient,
  msg: string = 'test'
) => {

  const fee = {
    amount: [
      {
        denom,
        amount,
      },
    ],
    gas: '1000000',
  };

  const token = {
    amount: '10000000',
    denom,
  };

  const msgSend = MsgSend.fromPartial({
    fromAddress,
    toAddress,
    amount: [token]
  });

  try {
    const tx = await send(signingClient, fromAddress, msgSend, fee, msg)
    console.log(tx);
  } catch (error) {
    console.error(error);
  }
}

export const getBalance = async (address: string, rpcEndpoint: string, denom: string) => {
  const queryClient = await createCosmosQueryClient(rpcEndpoint)
  const { balance } = await getBalanceQuery(queryClient, {
    address,
    denom,
  })
  return balance
}