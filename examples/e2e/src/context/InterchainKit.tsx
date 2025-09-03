"use client";

import { ChainProvider, InterchainWalletModal } from "@interchain-kit/react";
import {
  chain as osmosisChain,
  assetList as osmosisAssetList,
} from "chain-registry/mainnet/osmosis";
import {
  chain as cosmoshubChain,
  assetList as cosmoshubAssetList,
} from "chain-registry/mainnet/cosmoshub";
import {
  chain as solanaChain,
  assetList as solanaAssetList,
} from "chain-registry/mainnet/solana";

import {
  chain as ethereumChain,
  assetList as ethereumAssetList,
} from "chain-registry/mainnet/ethereum";

import { useChain as useStarshipChain } from "@/starship/hook";
import { useEffect, useState } from "react";
import { receiverWallet, senderWallet } from "@/wallet";
import { notInstalledWallet } from "@/wallet/NotInstalledWallet";
import { mockWallet } from "@/wallet/MockWallet";
import { rejectSigningWallet } from "@/wallet/RejectSigningWallet";
import { multipleAccountWallet } from "@/wallet/MultipleAccountWallet";
import {
  mockSolanaWalletReceiver,
  mockSolanaWalletSender,
} from "@/wallet/solana/wallet";
import {
  mockEthereumWalletReceiver,
  mockEthereumWalletSender,
} from "@/wallet/ethereum/wallet";
import {
  createAssetListFromEthereumChainInfo,
  createChainFromEthereumChainInfo,
} from "@/utils/eth-test-net";

export const InterchainKit = ({ children }: { children: React.ReactNode }) => {
  const [isRpcReady, setRpcReady] = useState(false);

  const [endpoint, setEndpoint] = useState({
    osmosis: "",
    cosmoshub: "",
  });
  const osmosis = useStarshipChain("osmosis");
  const cosmoshub = useStarshipChain("cosmoshub");

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
    chainId: "0xaa36a7", // Sepolia Testnet
    chainName: "Sepolia Testnet",
    rpcUrls: [
      "https://ethereum-sepolia.rpc.subquery.network/public",
      "https://eth-sepolia.public.blastapi.io",
      "https://ethereum-sepolia-rpc.publicnode.com",
    ],
    nativeCurrency: {
      name: "Sepolia ETH",
      symbol: "USDC",
      decimals: 18,
    },
    blockExplorerUrls: ["https://goerli.etherscan.io"],
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
