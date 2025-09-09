'use client';

import { MockEthereumWallet } from '@interchain-kit/mock-wallet';
import { useChainWallet } from '@interchain-kit/react';

import { mockEthereumWalletSender } from '@/wallet/ethereum/wallet';

export default function EthereumUx() {
  const { address, connect, wallet } = useChainWallet(
    'Sepolia Testnet',
    mockEthereumWalletSender.info.name
  );

  const changeAccount = () => {
    const w = wallet.getWalletOfType(MockEthereumWallet);
    w?.switchAccount();
  };

  return (
    <div>
      <p>account: {address}</p>
      <button onClick={connect}>connect</button>
      <button onClick={changeAccount}>changeAccount</button>
    </div>
  );
}
