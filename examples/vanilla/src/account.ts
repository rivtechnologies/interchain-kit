
import { assetList, chain } from '@chain-registry/v2/mainnet/osmosis';
import { WalletManager } from '@interchain-kit/core';
import { keplrWallet } from '@interchain-kit/keplr-extension';

const chainName = 'osmosis'
const walletName = 'keplr-extension'

const wm = await WalletManager.create([chain], [assetList], [keplrWallet])

const getAccount = async () => {
  const account = await wm.getAccount(walletName, chainName)
  document.querySelector('#account')!.textContent = JSON.stringify(account)
}

const button = document.querySelector('#query')

button?.addEventListener('click', getAccount)