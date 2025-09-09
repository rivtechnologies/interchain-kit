import { useChainWallet } from '@interchain-kit/react';
import { MsgTransfer, send, transfer } from 'interchainjs';

import { useChain as useStarshipChain } from '@/starship/hook';

export const useSendToken = (chainName: string, walletName: string) => {

  const { chainInfo } = useStarshipChain(chainName);


  const { signingClient, address: fromAddress, assetList } = useChainWallet(chainName, walletName);


  const denom = assetList.assets[0].base;

  const sendNativeToken = async (toAddress: string, amount: string) => {
    const fee = {
      amount: [{ denom, amount }],
      gas: '100000',
    };
    if (signingClient) {
      const res = await send(signingClient, fromAddress, {
        fromAddress: fromAddress,
        toAddress: toAddress,
        amount: [
          {
            denom,
            amount: amount,
          },
        ],
      }, fee, 'send native token');

      console.log('Transaction result:', res);

      try {
        await res.wait();
      } catch (err) {
        console.log(err);
      }
    }



  };


  const sendIbcToken = async (toAddress: string, amount: string) => {
    if (signingClient) {

      const fee = {
        amount: [{ denom, amount: '1000' }],
        gas: '200000',
      };

      const token = {
        amount, // Different amount to distinguish from other tests
        denom,
      };

      const currentTime = Math.floor(Date.now()) * 1000000;
      const timeoutTime = currentTime + 300 * 1000000000; // 5 minutes

      const ibcInfos = chainInfo.fetcher.getChainIbcData(chainName);

      const chains = chainInfo.fetcher.chains;

      const toChain = chains.find((c) => c.bech32_prefix === toAddress.split('1')[0]);

      const ibcInfo = ibcInfos.find(
        (i) =>
          i.chain_1.chain_name === chainName &&
          i.chain_2.chain_name === toChain?.chain_name
      );

      const { port_id: sourcePort, channel_id: sourceChannel } =
        ibcInfo!.channels[0].chain_1;

      console.log(sourcePort, sourceChannel);

      const res = await transfer(signingClient, fromAddress, MsgTransfer.fromPartial({
        sourcePort,
        sourceChannel,
        token,
        sender: fromAddress,
        receiver: toAddress,
        timeoutHeight: undefined,
        timeoutTimestamp: BigInt(timeoutTime),
        memo: 'test transfer',
      }), fee, 'send ibc');

      console.log('res:', res);

      try {
        await res.wait();
      } catch (error) {
        console.log(error);
      }
    }
  };

  const sendToken = async (toAddress: string, amount: string) => {
    const fromChainPrefix = fromAddress.split('1')[0];
    const toChainPrefix = toAddress.split('1')[0];

    console.log('fromChainPrefix:', fromChainPrefix);
    console.log('toChainPrefix:', toChainPrefix);

    if (fromChainPrefix === toChainPrefix) {
      await sendNativeToken(toAddress, amount);
    } else {
      await sendIbcToken(toAddress, amount);
    }
  };


  return sendToken;
};