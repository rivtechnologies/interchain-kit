import { useChain, useWalletModal } from "@interchain-kit/react";

export default function ActiveWallet() {
  const { address, wallet } = useChain("cosmoshub");
  const { open } = useWalletModal();
  return (
    <>
      <button onClick={open}>open wallets modal</button>
      <p>{wallet?.walletState}</p>
      <p>{wallet?.option?.prettyName}</p>
      <p>{address}</p>
    </>
  );
}
