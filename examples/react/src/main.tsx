import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { InterChainProvider } from '@interchain-kit/react'


import { assetLists, chains } from '@chain-registry/v2';
import { BaseWallet } from '@interchain-kit/core'
import { keplrWallet } from '@interchain-kit/keplr-extension'
import { keplrMobile } from '@interchain-kit/keplr-mobile'
import { leapWallet } from '@interchain-kit/leap-extension'
import { leapMobile } from '@interchain-kit/leap-mobile'
import { okxWallet } from '@interchain-kit/okx-extension'
import { coin98Wallet } from '@interchain-kit/coin98-extension'

const chainNames = ['juno', 'cosmoshub', 'stargaze']

const _chains = chains.filter(c => chainNames.includes(c.chainName))
const _assetLists = assetLists.filter(a => chainNames.includes(a.chainName))
const _wallets: BaseWallet[] = [keplrWallet, keplrMobile, leapWallet, leapMobile, okxWallet, coin98Wallet]


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <InterChainProvider chains={_chains} wallets={_wallets} assetLists={_assetLists}>
      <App />
    </InterChainProvider>
  </React.StrictMode>,
)
