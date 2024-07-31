import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ChainProvider } from '@interchain-kit/react'

import { assetLists, chains } from '@chain-registry/v2';
import { BaseWallet, WCWallet } from '@interchain-kit/core'
import { keplrWallet } from '@interchain-kit/keplr-extension'
import { leapWallet } from '@interchain-kit/leap-extension'
import { okxWallet } from '@interchain-kit/okx-extension'
import { coin98Wallet } from '@interchain-kit/coin98-extension'
import { ledgerWallet } from '@interchain-kit/ledger'

const chainNames = ['osmosis', 'juno', 'cosmoshub', 'stargaze', 'noble']

const walletConnect = new WCWallet()

const _chains = chains.filter(c => chainNames.includes(c.chainName))
const _assetLists = assetLists.filter(a => chainNames.includes(a.chainName))
const _wallets: BaseWallet[] = [keplrWallet, leapWallet, okxWallet, coin98Wallet, ledgerWallet, walletConnect]

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChainProvider chains={_chains} wallets={_wallets} assetLists={_assetLists} signerOptions={{}} endpointOptions={{}}>
      <App />
    </ChainProvider>
  </React.StrictMode>,
)
