'use client';

import { ChainProvider, InterchainWalletModal } from '@interchain-kit/react';
import {
  assetList as cosmoshubAssetList,
  chain as cosmoshubChain,
} from 'chain-registry/mainnet/cosmoshub';
import {
  assetList as osmosisAssetList,
  chain as osmosisChain,
} from 'chain-registry/mainnet/osmosis';
import {
  assetList as solanaAssetList,
  chain as solanaChain,
} from 'chain-registry/mainnet/solana';
import { useEffect, useState } from 'react';

import { useChain as useStarshipChain } from '@/starship/hook';
import {
  createAssetListFromEthereumChainInfo,
  createChainFromEthereumChainInfo,
} from '@/utils/eth-test-net';
import { receiverWallet, senderWallet } from '@/wallet';
import {
  mockEthereumWalletReceiver,
  mockEthereumWalletSender,
} from '@/wallet/ethereum/wallet';
import { mockWallet } from '@/wallet/MockWallet';
import { multipleAccountWallet } from '@/wallet/MultipleAccountWallet';
import { notInstalledWallet } from '@/wallet/NotInstalledWallet';
import { rejectSigningWallet } from '@/wallet/RejectSigningWallet';
import {
  mockSolanaWalletReceiver,
  mockSolanaWalletSender,
} from '@/wallet/solana/wallet';

export const InterchainKit = ({ children }: { children: React.ReactNode }) => {
  const [isRpcReady, setRpcReady] = useState(false);

  const [endpoint, setEndpoint] = useState({
    osmosis: '',
    cosmoshub: '',
  });
  const osmosis = useStarshipChain('osmosis');
  const cosmoshub = useStarshipChain('cosmoshub');

  const initStarship = async () => {
    await Promise.all([
      osmosis.getRpcEndpoint(),
      cosmoshub.getRpcEndpoint(),
    ]).then((result) => {
      setEndpoint({
        osmosis: result[0],
        cosmoshub: result[1],
      });
    });

    setRpcReady(true);
  };

  useEffect(() => {
    initStarship();
  }, []);

  if (!isRpcReady) {
    return <div>Loading...</div>;
  }

  const sepoliaEthereumTestNet = {
    chainId: '0xaa36a7', // Sepolia Testnet
    chainName: 'Sepolia Testnet',
    rpcUrls: [
      'https://ethereum-sepolia.rpc.subquery.network/public',
      'https://eth-sepolia.public.blastapi.io',
      'https://ethereum-sepolia-rpc.publicnode.com',
    ],
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'USDC',
      decimals: 18,
    },
    blockExplorerUrls: ['https://goerli.etherscan.io'],
  };
  const sepoliaEthereumChain = createChainFromEthereumChainInfo(
    sepoliaEthereumTestNet
  );
  const sepoliaEthereumAssetList = createAssetListFromEthereumChainInfo(
    sepoliaEthereumTestNet
  );

  return (
    <ChainProvider
      chains={[osmosisChain, cosmoshubChain, solanaChain, sepoliaEthereumChain]}
      assetLists={[
        osmosisAssetList,
        cosmoshubAssetList,
        solanaAssetList,
        sepoliaEthereumAssetList,
      ]}
      wallets={[
        mockWallet,
        senderWallet,
        receiverWallet,
        notInstalledWallet,
        rejectSigningWallet,
        multipleAccountWallet,
        mockSolanaWalletSender,
        mockSolanaWalletReceiver,
        mockEthereumWalletSender,
        mockEthereumWalletReceiver,
      ]}
      walletModal={() => <InterchainWalletModal />}
      signerOptions={{
        signing: (chainName) => {
          return {
            broadcast: {
              deliverTx: true,
            },
          };
        },
      }}
      endpointOptions={{
        endpoints: {
          osmosis: {
            rpc: [endpoint.osmosis],
          },
          cosmoshub: {
            rpc: [endpoint.cosmoshub],
          },
        },
      }}
    >
      {children}
    </ChainProvider>
  );
};
