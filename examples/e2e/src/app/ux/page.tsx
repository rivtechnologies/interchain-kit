"use client";

import {
  MultipleAccountCosmosWallet,
  multipleAccountWallet,
} from "@/wallet/MultipleAccountWallet";
import { useChainWallet } from "@interchain-kit/react";

export default function UxPage() {
  const { address, connect, wallet } = useChainWallet(
    "osmosis",
    multipleAccountWallet.info.name
  );

  const changeAccount = () => {
    const w = wallet.getWalletOfType(MultipleAccountCosmosWallet);
    console.log("changeAccount", w, wallet);
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
