"use client";

import { useChainWallet } from "@interchain-kit/react";
import { useState } from "react";
import { ethers } from "ethers";
import { EthereumWallet } from "@interchain-kit/core";

const SEPOLIA_RPC = "https://eth-sepolia.api.onfinality.io/public";

export default function Transaction() {
  const sender = useChainWallet(
    "Sepolia Testnet",
    "Mock Ethereum Wallet Sender"
  );
  const receiver = useChainWallet(
    "Sepolia Testnet",
    "Mock Ethereum Wallet Receiver"
  );

  const [senderBalance, setSenderBalance] = useState<string>("0");
  const [receiverBalance, setReceiverBalance] = useState<string>("0");

  const getSenderBalance = async () => {
    try {
      if (!sender.address) {
        console.error("Sender not connected");
        return;
      }

      const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
      const balance = await provider.getBalance(sender.address);
      setSenderBalance(Number(balance));
      console.log("Sender balance:", balance, "ETH");
    } catch (error) {
      console.error("Error getting sender balance:", error);
    }
  };

  const getReceiverBalance = async () => {
    try {
      if (!receiver.address) {
        console.error("Receiver not connected");
        return;
      }

      const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
      const balance = await provider.getBalance(receiver.address);
      setReceiverBalance(balance.toString());
      console.log("Receiver balance:", balance, "ETH");
    } catch (error) {
      console.error("Error getting receiver balance:", error);
    }
  };

  const sendSepolia = async (
    fromAddress: string,
    toAddress: string,
    amount: string
  ) => {
    try {
      if (!sender.address || !receiver.address) {
        console.error("Both sender and receiver must be connected");
        return;
      }

      // Get the specific Ethereum wallet instance
      const ethereumWallet = sender.wallet?.getWalletOfType(EthereumWallet);
      if (!ethereumWallet) {
        console.error("No Ethereum wallet available from sender wallet");
        return;
      }

      // Create transaction
      const tx = {
        from: fromAddress,
        to: toAddress,
        value: amount,
      };

      // Send transaction using the mock wallet's sendTransaction method
      const transactionHash = await ethereumWallet.sendTransaction(tx);
      console.log("Transaction sent:", transactionHash);

      // Update balances after successful transaction

      const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
      const receipt = await provider.waitForTransaction(transactionHash, 1); // 等待1个确认

      if (receipt && receipt.status === 1) {
        console.log("Transaction confirmed:", receipt);

        // Update balances after successful transaction
        await getSenderBalance();
        await getReceiverBalance();
      } else {
        console.error("Transaction failed");
      }
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

  return (
    <div>
      <div id="sender">
        <h1>Sender</h1>
        <button onClick={() => sender.connect()}>connect sender</button>
        <button onClick={getSenderBalance}>getSenderBalance</button>
        <div>balance: {senderBalance}</div>
        <div>account: {sender.address}</div>
        <div>
          <button
            onClick={() => sendSepolia(sender.address, receiver.address, "1")}
          >
            send Sepolia ETH
          </button>
        </div>
      </div>
      <div id="receiver">
        <h1>Receiver</h1>
        <button onClick={() => receiver.connect()}>connect receiver</button>
        <button onClick={getReceiverBalance}>getReceiverBalance</button>
        <div>balance: {receiverBalance}</div>
        <div>account: {receiver.address}</div>
      </div>
    </div>
  );
}
