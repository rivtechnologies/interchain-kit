import { WCWallet } from "@interchain-kit/core";
import {
  useCurrentWallet,
  useChain,
  useWalletManager,
} from "@interchain-kit/react";
import { useRef, useState } from "react";
import { getBalance, sendToken } from "../utils/helpers";

const WalletConnect = () => {
  const [balance, setBalance] = useState<any>();
  const toAddressRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  const currentWallet = useCurrentWallet() as WCWallet;

  const { openView, address, disconnect, chain, signingClient, rpcEndpoint } =
    useChain("osmosistestnet");

  const denom = chain.staking?.stakingTokens[0].denom as string;

  const handleSendToken = () => {
    console.log(signingClient);

    const toAddress = toAddressRef.current?.value as string;
    const amount = amountRef.current?.value as string;
    sendToken(address, toAddress, amount, denom, signingClient);
  };

  const handleGetBalance = async () => {
    const balance = await getBalance(address, rpcEndpoint as string, denom);
    setBalance(balance);
  };

  const handleGetPairings = async () => {
    const pairings = await currentWallet.signClient.pairing.getAll();
    console.log(pairings);
  };

  const handleGetSessions = async () => {
    const sessions = await currentWallet.signClient.session.getAll();
    console.log(sessions);
  };

  return (
    <div>
      <p>current chain: {chain.chainName}</p>
      <p>
        current address: {address} <button>get address</button>
      </p>
      <p>
        balance: {JSON.stringify(balance)}
        <button onClick={handleGetBalance}>get balance</button>
      </p>
      <p>
        <button onClick={openView}>openview</button>
      </p>
      <p>
        <button onClick={disconnect}>disconnect</button>
      </p>
      <p>
        <button onClick={handleGetPairings}>get pairings</button>
      </p>
      <p>
        <button onClick={handleGetSessions}>get sessions</button>
      </p>
      <p>
        <button
          onClick={async () => {
            console.log("ping");
            const result = await currentWallet.ping();
            console.log(result);
          }}
        >
          ping
        </button>
      </p>
      <p>
        to address: <input type="text" ref={toAddressRef} />
        amount: <input type="text" ref={amountRef} />
        <button onClick={handleSendToken}>send token</button>
      </p>
    </div>
  );
};

export default WalletConnect;
