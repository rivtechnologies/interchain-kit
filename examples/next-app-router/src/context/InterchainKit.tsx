'use client';

import { keplrWallet } from '@interchain-kit/keplr-extension';
import { ChainProvider, InterchainWalletModal } from '@interchain-kit/react';
import { assetList,chain } from 'chain-registry/mainnet/osmosis';
export const InterchainKit = ({ children }: { children: React.ReactNode }) => {
  return (
    <ChainProvider
      chains={[chain]}
      assetLists={[assetList]}
      wallets={[keplrWallet]}
      walletModal={() => <InterchainWalletModal />}
    >
      {children}
    </ChainProvider>
  );
};
