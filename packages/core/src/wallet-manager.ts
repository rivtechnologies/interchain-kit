import { Chain, AssetList } from '@chain-registry/v2-types'
import { BaseWallet } from './base-wallet'
import { MobileWallet } from './mobile-wallet'
import { ExtensionWallet } from './extension-wallet'

export class WalletManager {
  chains: Chain[] = []
  assetLists: AssetList[] = []
  wallets: BaseWallet[] = []
  currentWallet: BaseWallet | undefined

  constructor(chain: Chain[], assetLists: AssetList[], wallets: BaseWallet[]) {
    this.chains = chain
    this.assetLists = assetLists
    this.wallets = wallets
  }

  async init() {
    await Promise.all(this.wallets.map(async (wallet) => wallet.init()))
  }

  async selectWallet(walletName: string) {
    const wallet = this.wallets.find(w => w.option.name === walletName)

    if (!wallet) {
      throw new Error(`Wallet ${walletName} not found, please add it first`)
    }

    this.currentWallet = wallet
  }

  getSelectedWallet(): BaseWallet {
    const currentWallet = this.currentWallet
    if (!currentWallet) {
      throw new Error('No wallet is currently being used')
    }
    return this.currentWallet
  }

  enableChains(chainNames: string | string[], onApprove?: () => void, onGenerateParingUri?: (uri: string) => void) {

    const wallet = this.getSelectedWallet()

    const _chainNames = Array.isArray(chainNames) ? chainNames : [chainNames]
    const chainIds: string[] = []

    this.chains.forEach((chain) => {
      if (_chainNames.includes(chain.chainName)) {
        chainIds.push(chain.chainId)
      } else {
        throw new Error(`Chain ${chain.chainName} not found, please add it first`)
      }
    })

    if (wallet instanceof MobileWallet) {
      wallet.connect(chainIds, onApprove, onGenerateParingUri)
    } else {
      wallet.enable(chainIds)
    }
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