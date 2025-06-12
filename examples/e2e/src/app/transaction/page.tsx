"use client";

import { receiverWallet, senderWallet } from "@/wallet";
import { useChainWallet } from "@interchain-kit/react";
import { Coin, getAllBalances } from "interchainjs";
import { useState } from "react";
import { useChain as useStarshipChain } from "@/starship/hook";
import { useSendToken } from "@/hook/useSendToken";

export const SenderWalletBlock = ({
  chainName,
  amountToSend,
}: {
  chainName: string;
  amountToSend: string;
}) => {
  const { creditFromFaucet, getCoin } = useStarshipChain(chainName);

  const senderChainWallet = useChainWallet(chainName, senderWallet.info.name);

  const sendToken = useSendToken(chainName, senderWallet.info.name);

  const osmosisReceiverWallet = useChainWallet(
    "osmosis",
    receiverWallet.info.name
  );

  const handleFaucet = async () => {
    const res = await creditFromFaucet(
      senderChainWallet.address,
      (
        await getCoin()
      ).base
    );
    await handleGetAllBalances();
  };

  const [allBalances, setAllBalances] = useState<Coin[]>([]);

  const denom = senderChainWallet.assetList.assets[0].base;

  const handleGetAllBalances = async () => {
    const balances = await getAllBalances(
      senderChainWallet.rpcEndpoint as string,
      {
        address: senderChainWallet.address,
        resolveDenom: true,
      }
    );
    console.log("All balances:", balances.balances);
    setAllBalances(balances.balances);
  };

  const [sendTokenDone, setSendTokenDone] = useState(false);

  const handleSendToken = async () => {
    setSendTokenDone(false);
    await sendToken(osmosisReceiverWallet.address, amountToSend);
    setSendTokenDone(true);
  };

  return (
    <div data-testid={`sender-wallet-${chainName}`}>
      <h3>Sender Wallet {chainName} </h3>
      <p>address: {senderChainWallet.address}</p>
      <button onClick={senderChainWallet.connect}>connect</button>
      <button onClick={handleFaucet}>faucet sender wallet</button>
      <button onClick={handleGetAllBalances}>get balance</button>
      <button onClick={handleSendToken}>
        send token {amountToSend} {denom}
        {sendTokenDone && <span> (done)</span>}
      </button>
      <p>
        {allBalances.map((balance) => (
          <span key={balance.denom}>
            {balance.amount} {balance.denom}{" "}
          </span>
        ))}
      </p>
    </div>
  );
};

export const ReceiverWallet = () => {
  const { address, rpcEndpoint, connect, status } = useChainWallet(
    "osmosis",
    receiverWallet.info.name
  );

  const [allBalances, setAllBalances] = useState<Coin[]>([]);

  const handleGetAllBalances = async () => {
    const balances = await getAllBalances(rpcEndpoint as string, {
      address,
      resolveDenom: true,
    });
    console.log("All balances:", balances.balances);
    setAllBalances(balances.balances);
  };

  return (
    <div data-testid="receiver-wallet">
      <h3>Receiver Wallet Osmosis</h3>
      <p>address: {address}</p>
      <p>status:{status}</p>
      <button onClick={connect}>connect</button>
      <button onClick={handleGetAllBalances}>get balances</button>
      <p>
        {allBalances.map((balance) => (
          <>
            <span key={balance.denom}>
              {balance.amount} {balance.denom}{" "}
            </span>
            <br />
          </>
        ))}
      </p>
    </div>
  );
};

export default function () {
  return (
    <div>
      <SenderWalletBlock chainName={"osmosis"} amountToSend="1111111111" />
      <SenderWalletBlock chainName={"cosmoshub"} amountToSend="2222222222" />
      <ReceiverWallet />
    </div>
  );
}
