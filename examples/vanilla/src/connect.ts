import { chain, assetList } from '@chain-registry/v2/mainnet/cosmoshub'
import { WalletManager, WalletState } from '@interchain-kit/core'
import { keplrWallet } from '@interchain-kit/keplr-extension'

const button = document.querySelector('#connect')
const disconnectButton = document.querySelector('#disconnect')

const walletManager = await WalletManager.create(
  [chain],
  [assetList],
  [keplrWallet]
)



button?.addEventListener('click', async () => {
  try {
    await walletManager.connect(keplrWallet.info?.name as string, chain.chainName)
    const stateElement = document.querySelector('#state');
    if (stateElement) {
      stateElement.textContent = 'Connected';
    }
  } catch (error) {
    console.error(error)
  }
})

disconnectButton?.addEventListener('click', async () => {

  try {
    await walletManager.disconnect(keplrWallet.info?.name as string, chain.chainName)
    const stateElement = document.querySelector('#state');
    if (stateElement) {
      stateElement.textContent = 'Disconnected';
    }
  } catch (error) {
    console.log(error)
  }
})