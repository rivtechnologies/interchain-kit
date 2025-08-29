"use client";

import {
  mockEthereumWalletReceiver,
  mockEthereumWalletSender,
} from "@/wallet/ethereum/wallet";
import { useChain, useChainWallet } from "@interchain-kit/react";
export default function EthereumWalletConnect() {
  const { openView } = useChain("ethereum");

  const sender = useChainWallet("ethereum", mockEthereumWalletSender.info.name);
  const receiver = useChainWallet(
    "ethereum",
    mockEthereumWalletReceiver.info.name
  );

  return (
    <div>
      <button onClick={() => sender.connect()}>connect sender</button>
      <div>sender: {sender.address}</div>
      <button onClick={() => receiver.connect()}>connect receiver</button>
      <div>receiver: {receiver.address}</div>
      <button onClick={openView}>Open Modal</button>
    </div>
  );
}
