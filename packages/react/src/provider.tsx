import { AssetList, Chain } from "@chain-registry/types";
import {
  BaseWallet,
  EndpointOptions,
  MultiChainWallet,
  SignerOptions,
} from "@interchain-kit/core";
import { WalletManagerStore } from "@interchain-kit/store";
import React, { ReactElement, useEffect, useRef } from "react";
import { createContext, useContext } from "react";

import { ModalRenderer, WalletModalProps } from "./modal";

type InterchainWalletContextType = WalletManagerStore;

type InterchainWalletProviderProps = {
  chains: Chain[];
  assetLists: AssetList[];
  wallets: BaseWallet[];
  signerOptions?: SignerOptions;
  endpointOptions?: EndpointOptions;
  children: React.ReactNode;
  walletModal?: (props: WalletModalProps) => ReactElement;
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
  walletModal: ProviderWalletModal,
}: InterchainWalletProviderProps) => {
  const store = useRef<InterchainWalletContextType | null>(null);

  if (!store.current) {
    store.current = new WalletManagerStore(
      chains,
      assetLists,
      wallets,
      signerOptions,
      endpointOptions
    );
  }

  useEffect(() => {
    store.current.init();
  }, []);

  return (
    <InterchainWalletContext.Provider value={store.current}>
      {children}
      {ProviderWalletModal && (
        <ModalRenderer walletModal={ProviderWalletModal} />
      )}
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
