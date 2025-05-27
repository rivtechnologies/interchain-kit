import { EthereumWallet } from "@interchain-kit/core";
import { useChain } from "@interchain-kit/react";
import React, { useState } from "react";

const EthereumSignMessage: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [signature, setSignature] = useState<string | null>(null);

  const { connect, address, disconnect, wallet } = useChain("ethereum");

  const connectWallet = async () => {
    connect();
  };

  const disconnectWallet = async () => {
    disconnect();
    setSignature(null);
  };

  const signMessage = async () => {
    const ethereumWallet = wallet.getWalletOfType(EthereumWallet);
    if (ethereumWallet) {
      try {
        const signedMessage = await ethereumWallet.signMessage(message);
        setSignature(signedMessage);
      } catch (error) {
        console.error("Error signing message:", error);
      }
    }
  };

  return (
    <div
      style={{ maxWidth: 500, margin: "2rem auto", fontFamily: "sans-serif" }}
    >
      <h2>Ethereum Sign Message Example</h2>
      {!address ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <button onClick={disconnectWallet}>Disconnect Wallet</button>
      )}
      <div>
        <div>
          <strong>Connected:</strong> {address}
        </div>
        <textarea
          rows={3}
          style={{ width: "100%", marginTop: 16 }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button style={{ marginTop: 16 }} onClick={signMessage}>
          Sign Message
        </button>
      </div>
      {signature && (
        <div style={{ marginTop: 16 }}>
          <strong>Signature:</strong>
          <pre style={{ whiteSpace: "break-spaces" }}>{signature}</pre>
        </div>
      )}
    </div>
  );
};

export default EthereumSignMessage;
