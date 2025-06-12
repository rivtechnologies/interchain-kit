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

import { useChain as useStarshipChain } from "@/starship/hook";
import { useEffect, useState } from "react";
import {
  mockWallet1,
  mockWallet2,
  notInstalledWallet,
  receiverWallet,
  senderWallet,
} from "@/wallet";

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

  return (
    <ChainProvider
      chains={[osmosisChain, cosmoshubChain]}
      assetLists={[osmosisAssetList, cosmoshubAssetList]}
      wallets={[
        mockWallet1,
        mockWallet2,
        senderWallet,
        receiverWallet,
        notInstalledWallet,
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
