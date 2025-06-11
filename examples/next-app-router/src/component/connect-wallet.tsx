"use client";

import { useChain } from "@interchain-kit/react";

export default function ConnectWallet() {
  const { connect, disconnect, status, address } = useChain("osmosis");

  return (
    <div>
      <button onClick={() => connect()}>Click to Connect</button>
      <button onClick={() => disconnect()}>Click to Disconnect</button>
      <p>{status}</p>
      <p>{address}</p>
    </div>
  );
}
