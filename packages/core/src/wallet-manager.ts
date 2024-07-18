
import { Chain, AssetList } from '@chain-registry/v2-types'
import { BaseWallet } from './base-wallet'
import { MobileWallet } from './mobile-wallet'
import { ExtensionWallet } from './extension-wallet'
import { WalletState } from './types'
import { createObservable } from './utils'

export class WalletManager {
  chains: Chain[] = []
  assetLists: AssetList[] = []
  wallets: BaseWallet[] = []
  currentWallet: BaseWallet | undefined
  constructor(chain: Chain[], assetLists: AssetList[], wallets: BaseWallet[], onUpdate?: () => void) {
    this.chains = chain
    this.assetLists = assetLists
    this.wallets = wallets.map(wallet => createObservable(wallet, onUpdate))

    return createObservable(this, onUpdate)
  }

  async init() {
    await Promise.all(this.wallets.map(async (wallet) => wallet.init()))
  }

  async connect(walletName: string, onApprove?: () => void, onGenerateParingUri?: (uri: string) => void) {

    const wallet = this.wallets.find(wallet => wallet.option.name === walletName)

    if (!wallet) {
      throw new Error(`Wallet ${walletName} not found, please add it first`)
    }

    const chainIds: string[] = this.chains.map(chain => chain.chainId)
    wallet.errorMessage = ''
    wallet.walletState = WalletState.Connecting
    try {
      if (wallet instanceof MobileWallet) {
        await wallet.connect(chainIds, onApprove, onGenerateParingUri)
      } else {
        await wallet.enable(chainIds)
      }
      wallet.walletState = WalletState.Connected
      this.currentWallet = wallet

    } catch (error: any) {
      wallet.walletState = WalletState.Disconnected
      wallet.errorMessage = error.message
    }
  }

  async disconnect(walletName: string) {
    const currentWallet = this.wallets.find(wallet => wallet.option.name === walletName)
    if (!currentWallet) {
      return
    }
    if (currentWallet instanceof MobileWallet) {
      // await currentWallet.disconnect()
    } else {
      await currentWallet.disable(this.chains.map(chain => chain.chainId))
    }
    currentWallet.walletState = WalletState.Disconnected
    this.currentWallet = null
  }

  getActiveWallet() {
    return this.currentWallet
  }

  getAllWalletsState() {
    return this.wallets.map(wallet => {
      if (wallet instanceof ExtensionWallet) {
        return wallet.isExtensionInstalled
      }
      return null
    })
  }

}