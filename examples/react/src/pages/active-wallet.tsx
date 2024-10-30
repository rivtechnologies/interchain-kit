import { useChain, useWalletModal } from "@interchain-kit/react";

export default function ActiveWallet() {
  const { address, wallet, logoUrl, connect, disconnect } = useChain("juno");
  const { open } = useWalletModal();
  return (
    <>
      <button onClick={open}>open wallets modal</button>
      <p>{wallet?.walletState}</p>
      <p>{wallet?.info?.prettyName}</p>

      <p>{address}</p>
      <img src={wallet?.info?.logo?.toString()} style={{ width: "100px" }} />
      <img src={logoUrl} style={{ width: "100px" }}></img>
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
    </>
  );
}
