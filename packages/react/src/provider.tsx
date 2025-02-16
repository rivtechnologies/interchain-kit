import React, { useEffect, useRef } from "react";
import { createContext, useContext } from "react";
import {
  BaseWallet,
  SignerOptions,
  EndpointOptions,
  WalletManager,
} from "@interchain-kit/core";
import { AssetList, Chain } from "@chain-registry/v2-types";
import { WalletModalProvider } from "./modal";

type InterchainWalletContextType = WalletManager;

type InterchainWalletProviderProps = {
  chains: Chain[];
  assetLists: AssetList[];
  wallets: BaseWallet[];
  signerOptions?: SignerOptions;
  endpointOptions?: EndpointOptions;
  children: React.ReactNode;
};

const InterchainWalletContext =
  createContext<InterchainWalletContextType | null>(null);

export const ChainProvider = ({
  chains,
  assetLists,
  wallets,
  signerOptions,
  endpointOptions,
  children,
}: InterchainWalletProviderProps) => {
  // const [_, forceRender] = useState({});

  const walletManager = new WalletManager(
    chains,
    assetLists,
    wallets,
    signerOptions,
    endpointOptions
  );

  useEffect(() => {
    walletManager.init();
  }, []);

  return (
    <InterchainWalletContext.Provider value={walletManager}>
      <WalletModalProvider>{children}</WalletModalProvider>
    </InterchainWalletContext.Provider>
  );
};

export const useInterchainWalletContext = () => {
  const context = useContext(InterchainWalletContext);
  if (!context) {
    throw new Error(
      "useInterChainWalletContext must be used within a InterChainProvider"
    );
  }
  return context;
};
