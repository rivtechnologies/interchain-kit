import { chain as cosmoshubChain, assetList as cosmoshubAssetList } from '@chain-registry/v2/mainnet/cosmoshub'
import { chain as junoChain, assetList as junoAssetList } from '@chain-registry/v2/mainnet/juno'
import { WalletManager } from '@interchain-kit/core'
import { keplrWallet } from '@interchain-kit/keplr-extension'


const walletManager = await WalletManager.create(
  [cosmoshubChain, junoChain],
  [cosmoshubAssetList, junoAssetList],
  [keplrWallet]
)

// pop up keplr extension wallet connect window to connect cosmoshub chain
await walletManager.connect(keplrWallet.info?.name as string, cosmoshubChain.chainName)

// pop up keplr extension wallet connect window to connect juno chain
await walletManager.connect(keplrWallet.info?.name as string, junoChain.chainName)


// disconnect cosmoshub chain from keplr wallet extension
await walletManager.disconnect(keplrWallet.info?.name as string, cosmoshubChain.chainName)

// disconnect juno chain from keplr wallet extension
await walletManager.disconnect(keplrWallet.info?.name as string, junoChain.chainName)

