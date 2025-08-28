"use client";

import {
  mockSolanaWalletReceiver,
  mockSolanaWalletSender,
} from "@/wallet/solana/wallet";
import { useChain, useChainWallet } from "@interchain-kit/react";
export default function SolanaWalletConnect() {
  const { openView } = useChain("solana");

  const sender = useChainWallet("solana", mockSolanaWalletSender.info.name);
  const receiver = useChainWallet("solana", mockSolanaWalletReceiver.info.name);

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
