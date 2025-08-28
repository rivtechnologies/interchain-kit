"use client";

import { mockSolanaWalletSender } from "@/wallet/solana/wallet";
import { MockSolanaWallet } from "@interchain-kit/mock-wallet";
import { useChainWallet } from "@interchain-kit/react";

export default function UxPage() {
  const { address, connect, wallet } = useChainWallet(
    "solana",
    mockSolanaWalletSender.info.name
  );

  const changeAccount = () => {
    const w = wallet.getWalletOfType(MockSolanaWallet);
    w?.changeWalletAccount();
  };

  return (
    <div>
      <p>account: {address}</p>
      <button onClick={connect}>connect</button>
      <button onClick={changeAccount}>changeAccount</button>
    </div>
  );
}
