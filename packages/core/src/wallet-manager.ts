import { WalletRepository } from './wallet-repository';
import { HttpEndpoint } from '@interchainjs/types';
import { Chain, AssetList } from '@chain-registry/v2-types'
import { BaseWallet } from './base-wallet'
import { ChainName, DeviceType, DownloadInfo, EndpointOptions, OS, SignerOptions, WalletManagerState, WalletState } from './types'
import { ChainNotExist, getChainNameFromLocalStorage, getWalletNameFromLocalStorage, ObservableObject, WalletNotExist } from './utils'
import { ICosmosGenericOfflineSigner } from '@interchainjs/cosmos/types/wallet';
import { SignerOptions as InterchainSignerOptions } from '@interchainjs/cosmos/types/signing-client';
import { SigningClient } from '@interchainjs/cosmos/signing-client'
import Bowser from 'bowser';

export class WalletManager extends ObservableObject {
  chains: Chain[] = []
  assetLists: AssetList[] = []
  wallets: BaseWallet[] = []
  walletRepositories: WalletRepository[] = []
  currentWalletName: string | undefined
  currentChainName: ChainName | undefined
  signerOptions: SignerOptions | undefined
  endpointOptions: EndpointOptions | undefined
  rpcEndpoint: Record<string, string | HttpEndpoint> = {}
  restEndpoint: Record<string, string | HttpEndpoint> = {}
  state: WalletManagerState = WalletManagerState.Initializing

  observableObj: any

  onInterchainStateUpdate: () => void

  constructor(
    chain: Chain[],
    assetLists: AssetList[],
    wallets: BaseWallet[],
    signerOptions?: SignerOptions,
    endpointOptions?: EndpointOptions,

    onInterchainStateUpdate?: () => void
  ) {
    super()
    this.onInterchainStateUpdate = onInterchainStateUpdate
    this.chains = chain
    this.assetLists = assetLists
    this.wallets = wallets
    this.on('interchainStateChange', this.onInterchainStateUpdate)
    this.walletRepositories = this.wallets.map(wallet => {
      const wr = new WalletRepository(chain, assetLists, wallet, this)
      wr.on('interchainStateChange', this.onInterchainStateUpdate)
      return wr
    })
    this.signerOptions = signerOptions
    this.endpointOptions = endpointOptions
    // return createObservable(this, onUpdate)
  }

  async init() {
    this.state = WalletManagerState.Initializing

    await Promise.all(this.wallets.map(async (wallet) => wallet.init()))

    const loggedWalletName = getWalletNameFromLocalStorage()
    const laggedChainName = getChainNameFromLocalStorage()
    if (loggedWalletName && laggedChainName) {
      await this.getWalletRepositoryByName(loggedWalletName).getChainAccountByName(laggedChainName)?.connect()
    }

    this.state = WalletManagerState.Initialized
  }

  static async create(
    chain: Chain[],
    assetLists: AssetList[],
    wallets: BaseWallet[],
    signerOptions?: SignerOptions,
    endpointOptions?: EndpointOptions,
    onUpdate?: () => void
  ) {
    const wm = new WalletManager(chain, assetLists, wallets, signerOptions, endpointOptions, onUpdate)
    await wm.init()

    return wm
  }

  addChains(chains: Chain[], assetLists: AssetList[], signerOptions?: SignerOptions, endpointOptions?: EndpointOptions) {
    const existChains = this.chains
    chains.forEach(newChain => {
      const existChain = existChains.find(c => c.chainId === newChain.chainId)
      if (!existChain) {
        this.chains.push(newChain)
        const assetList = assetLists.find(a => a.chainName === newChain.chainName)
        this.assetLists.push(assetList)
        this.walletRepositories.forEach(walletRepository => {
          walletRepository.addChains(newChain, assetList, signerOptions, endpointOptions)
        })
      } else {
        this.walletRepositories.forEach(walletRepository => {
          walletRepository.chainAccountMap.forEach((chainAccount) => {
            chainAccount.signerOptions = signerOptions?.signing?.(chainAccount.chain.chainName)
            chainAccount.rpcEndpoint = endpointOptions?.endpoints?.[chainAccount.chain.chainName].rpc[0]
          })
        })
      }
    })
  }

  async connect(walletName: string) {
    const chainId = this.chains.map(chain => chain.chainId)
    return this.getWalletRepositoryByName(walletName).connect(chainId)
  }

  async disconnect(walletName: string) {
    const chainId = this.chains.map(chain => chain.chainId)
    return this.getWalletRepositoryByName(walletName).disconnect(chainId)
  }

  assertChainExist(chainName: ChainName) {
    if (!this.chains.find(chain => chain.chainName === chainName)) {
      throw new ChainNotExist(chainName)
    }
  }

  assetWalletExist(walletName: string) {
    if (!this.walletRepositories.find(walletRepository => walletRepository.wallet.info.name === walletName)) {
      throw new WalletNotExist(walletName)
    }
  }

  getCurrentWallet(): WalletRepository | undefined {
    return this.walletRepositories.find(walletRepository => walletRepository.getWalletInfo().name === this.currentWalletName)
  }

  getChainLogoUrl(chainName: ChainName) {
    const assetList = this.assetLists.find(assetList => assetList.chainName === chainName)
    return assetList?.assets?.[0].logoURIs?.png || assetList?.assets?.[0].logoURIs?.svg || undefined
  }

  getWalletByName(walletName: string): BaseWallet | undefined {
    return this.walletRepositories.find(walletRepository => walletRepository.wallet.info.name === walletName)?.wallet
  }

  getWalletRepositoryByName(walletName: string): WalletRepository | undefined {
    return this.walletRepositories.find(walletRepository => walletRepository.wallet.info.name === walletName)
  }

  getChainByName(chainName: string): Chain | undefined {
    const chain = this.chains.find(chain => chain.chainName === chainName)
    return chain
  }

  getRpcEndpoint = async (wallet: BaseWallet, chainName: string) => {
    return this.getWalletRepositoryByName(wallet.info.name).getChainAccountByName(chainName).getRpcEndpoint()
  }

  getPreferSignType(chainName: string) {
    return this.getWalletRepositoryByName(this.currentWalletName).getChainAccountByName(chainName).getPreferredSignType()
  }

  getSignerOptions(chainName: string): InterchainSignerOptions {
    return this.signerOptions?.signing?.(chainName)
  }

  getOfflineSigner(wallet: BaseWallet, chainName: string): ICosmosGenericOfflineSigner {
    return this.getWalletRepositoryByName(wallet.info.name).getChainAccountByName(chainName).getOfflineSigner()
  }

  async getAccount(walletName: string, chainName: ChainName) {
    return this.getWalletRepositoryByName(walletName).getChainAccountByName(chainName).getAccount()
  }

  async getInterchainSignerOptions(walletName: string, chainName: string) {
    return this.getWalletRepositoryByName(walletName).getChainAccountByName(chainName).getSignerOptions()
  }

  isWalletConnected = (walletName: string) => {
    return this.getWalletByName(walletName)?.walletState === WalletState.Connected
  }

  async getSigningClient(walletName: string, chainName: ChainName): Promise<SigningClient> {
    return this.getWalletRepositoryByName(walletName).getChainAccountByName(chainName).getSigningClient()
  }

  getEnv() {
    const parser = Bowser.getParser(window.navigator.userAgent)
    const env = {
      browser: parser.getBrowserName(true),
      device: (parser.getPlatform().type || 'desktop') as DeviceType,
      os: parser.getOSName(true) as OS,
    }
    return env
  }

  getDownloadLink(walletName: string) {
    const env = this.getEnv()
    const wallet = this.getWalletByName(walletName)
    return wallet.info.downloads.find((d: DownloadInfo) => {
      if (d.device === 'desktop') {
        return d.browser === env.browser
      } else if (d.device === 'mobile') {
        return d.os === env.os
      } else {
        return null
      }
    })
  }

}