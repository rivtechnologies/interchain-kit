import React, { useEffect, useMemo, useState } from 'react'
import { createContext, useContext } from "react";
import { BaseWallet, WalletManager } from '@interChain-kit/core'
import { AssetList, Chain } from '@chain-registry/v2-types';

type InterChainWalletContextType = {
  walletManager: WalletManager
}

type InterChianWalletProviderProps = {
  chains: Chain[]
  assetLists: AssetList[]
  wallets: BaseWallet[]
  children: React.ReactNode
}

const InterChainWalletContext = createContext<InterChainWalletContextType | null>(null);

export const InterChainProvider = ({
  chains,
  assetLists,
  wallets,
  children
}: InterChianWalletProviderProps) => {

  const [_, forceRender] = useState(0)

  const walletManager = useMemo(() => {
    return new WalletManager(chains, assetLists, wallets, () => forceRender(prev => prev + 1))
  }, [])

  useEffect(() => {
    walletManager.init()
  }, [])


  return (
    <InterChainWalletContext.Provider value={{ walletManager }}>
      {children}
    </InterChainWalletContext.Provider>
  )
}

export const useInterChainWalletContext = () => {
  const context = useContext(InterChainWalletContext)
  if (!context) {
    throw new Error('useInterChainWalletContext must be used within a InterChainProvider')
  }
  return context
}