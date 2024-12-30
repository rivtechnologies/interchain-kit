import {
  useChain,
  useCurrentWallet,
  useWalletManager,
  useWalletModal,
} from "@interchain-kit/react";

export default function ActiveWallet() {
  const { address, wallet, logoUrl, connect, disconnect, chain } =
    useChain("juno");
  const { open } = useWalletModal();
  const { getOfflineSignerAmino, disconnectAll } = useCurrentWallet();
  const { addChains } = useWalletManager();

  return (
    <>
      <button onClick={open}>open wallets modal</button>
      <button
        onClick={async () => {
          const x = await getOfflineSignerAmino(chain.chainId as string);
          console.log(await x.getAccounts());
          addChains([], []);
        }}
      >
        open wallets modal
      </button>
      <p>{wallet?.walletState}</p>
      <p>{wallet?.info?.prettyName}</p>

      <p>{address}</p>
      <img src={wallet?.info?.logo?.toString()} style={{ width: "100px" }} />
      <img src={logoUrl} style={{ width: "100px" }}></img>
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect {chain?.chainName}</button>
      <button onClick={disconnectAll}>Disconnect All</button>
    </>
  );
}
