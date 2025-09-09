'use client';

import { MockSolanaWallet } from '@interchain-kit/mock-wallet';
import { useChainWallet } from '@interchain-kit/react';
import {
  clusterApiUrl,
  Connection,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import { useState } from 'react';

import {
  mockSolanaWalletReceiver,
  mockSolanaWalletSender,
} from '@/wallet/solana/wallet';

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export default function SolanaTransaction() {
  const sender = useChainWallet('solana', mockSolanaWalletSender.info.name);

  const receiver = useChainWallet('solana', mockSolanaWalletReceiver.info.name);

  const [senderBalance, setSenderBalance] = useState<number>(0);
  const [receiverBalance, setReceiverBalance] = useState<number>(0);

  const getSenderBalance = async () => {
    const solanaWallet = sender.wallet.getWalletOfType(MockSolanaWallet);
    const balance = await solanaWallet?.getBalance();
    setSenderBalance(balance ?? 0);
  };

  const getReceiverBalance = async () => {
    const solanaWallet = receiver.wallet.getWalletOfType(MockSolanaWallet);
    const balance = await solanaWallet?.getBalance();
    setReceiverBalance(balance ?? 0);
  };

  async function sendSOL(from: string, to: string, amount: number) {
    const solanaWallet = sender.wallet.getWalletOfType(MockSolanaWallet);
    const fromKey = new PublicKey(from);
    const toKey = new PublicKey(to);

    if (!solanaWallet) {
      throw new Error('Sender wallet not found');
    }

    // 检查余额
    const balance = await connection.getBalance(fromKey);
    console.log('Sender balance:', balance, 'lamports');

    if (balance < amount + 5000) {
      throw new Error('Insufficient balance to cover transfer + fee');
    }

    // 检查收款账户
    const toInfo = await connection.getAccountInfo(toKey);
    if (!toInfo) {
      console.warn(
        'Destination account does not exist, will be created automatically.'
      );
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKey,
        toPubkey: toKey,
        lamports: amount,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromKey;

    const signed = await solanaWallet.signTransaction(transaction);

    try {
      const signature = await connection.sendRawTransaction(
        signed.serialize(),
        {
          skipPreflight: false,
        }
      );
      console.log('Transaction signature:', signature);
      await connection.confirmTransaction(signature);
    } catch (error: any) {
      if (error.getLogs) {
        console.error('Transaction logs:', await error.getLogs());
      } else {
        console.error(error);
      }
    }
  }

  return (
    <div>
      <div id="sender">
        <h1>Sender</h1>
        <button onClick={() => sender.connect()}>connect sender</button>
        <button onClick={getSenderBalance}>getSenderBalance</button>
        <div>balance: {senderBalance}</div>
        <div>account: {sender.address}</div>
        <div>
          <button onClick={() => sendSOL(sender.address, receiver.address, 1)}>
            send SOL
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
