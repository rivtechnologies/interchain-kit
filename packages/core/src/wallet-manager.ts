import { HttpEndpoint } from '@interchainjs/types';
import { Chain, AssetList } from '@chain-registry/v2-types'
import { BaseWallet } from './base-wallet'
import { WCWallet } from './wc-wallet';
import { ChainName, EndpointOptions, SignerOptions, WalletState } from './types'
import { ChainNotExist, createObservable, getValidRpcEndpoint, isValidRpcEndpoint, NoValidRpcEndpointFound, WalletNotExist } from './utils'
import { InterchainJsSigner } from './client';
import { OfflineSigner } from '@interchainjs/cosmos/types/wallet';
import { SignerOptions as InterchainSignerOptions } from 'interchainjs/types';

export class WalletManager {
  chains: Chain[] = []
  assetLists: AssetList[] = []
  wallets: BaseWallet[] = []
  activeWalletName: string | undefined
  signerOptions: SignerOptions | undefined
  endpointOptions: EndpointOptions | undefined
  rpcEndpoint: Record<string, string | HttpEndpoint> = {}
  restEndpoint: Record<string, string | HttpEndpoint> = {}

  constructor(
    chain: Chain[],
    assetLists: AssetList[],
    wallets: BaseWallet[],
    signerOptions?: SignerOptions,
    endpointOptions?: EndpointOptions,

    onUpdate?: () => void
  ) {
    this.chains = chain
    this.assetLists = assetLists
    this.wallets = wallets.map(wallet => createObservable(wallet, onUpdate))
    this.signerOptions = signerOptions
    this.endpointOptions = endpointOptions

    return createObservable(this, onUpdate)
  }

  async init() {
    await Promise.all(this.wallets.map(async (wallet) => wallet.init()))
  }

  async connect(walletName: string, onApprove?: () => void, onGenerateParingUri?: (uri: string) => void) {

    const wallet = this.wallets.find(wallet => wallet.option.name === walletName)

    if (!wallet) {
      throw new WalletNotExist(walletName)
    }

    const chainIds: string[] = this.chains.map(chain => chain.chainId)

    this.activeWalletName = walletName

    wallet.errorMessage = ''
    wallet.walletState = WalletState.Connecting

    try {
      if (wallet instanceof WCWallet) {
        await wallet.connect(chainIds, onApprove, onGenerateParingUri)
      } else {
        await wallet.connect(chainIds)
      }

      wallet.walletState = WalletState.Connected

    } catch (error: any) {
      wallet.walletState = WalletState.Reject
      wallet.errorMessage = error.message
      throw error
    }
  }

  async disconnect(walletName: string) {
    const wallet = this.wallets.find(wallet => wallet.option.name === walletName)

    if (wallet instanceof WCWallet) {
      await wallet.disconnect()
    } else {
      await wallet.disconnect(this.chains.map(chain => chain.chainId))
    }
    wallet.walletState = WalletState.Disconnected

    if (this.activeWalletName === walletName) {
      this.activeWalletName = undefined
    }
  }

  getActiveWallet() {
    return this.wallets.find(wallet => wallet.option.name === this.activeWalletName)
  }

  addChain(chain: Chain) {
    this.chains.push(chain)
  }

  getChainLogo(chainName: ChainName) {
    const assetList = this.assetLists.find(assetList => assetList.chainName === chainName)
    return assetList.assets[0].logoURIs.png || assetList.assets[0].logoURIs.svg || undefined
  }

  getChain(chainName: ChainName) {
    const chain = this.chains.find(c => c.chainName === chainName)
    if (!chain) {
      throw new ChainNotExist(chainName)
    }
    return chain
  }

  getRpcEndpoint = async (wallet: BaseWallet, chainName: string) => {
    const chain = this.getChain(chainName)

    const providerRpcEndpoints = this.endpointOptions?.endpoints?.[chain.chainName]?.rpc || []
    const walletRpcEndpoints = wallet?.option?.endpoints?.[chain.chainName]?.rpc || []
    const chainRpcEndpoints = chain.apis.rpc.map(url => url.address)

    if (providerRpcEndpoints?.[0] && await isValidRpcEndpoint(providerRpcEndpoints[0])) {
      return providerRpcEndpoints[0]
    }

    if (walletRpcEndpoints?.[0] && await isValidRpcEndpoint(providerRpcEndpoints[0])) {
      return walletRpcEndpoints[0]
    }

    if (chainRpcEndpoints[0] && await isValidRpcEndpoint(chainRpcEndpoints[0])) {
      return chainRpcEndpoints[0]
    }

    const validRpcEndpoint = await getValidRpcEndpoint([...providerRpcEndpoints, ...walletRpcEndpoints, ...chainRpcEndpoints])

    if (validRpcEndpoint === '') {
      throw new NoValidRpcEndpointFound()
    }

    return validRpcEndpoint
  }

  getPreferSignType(chainName: string) {
    return this.signerOptions?.preferredSignType?.(chainName) || 'amino'
  }

  getSignerOptions(chainName: string): InterchainSignerOptions {
    return this.signerOptions?.signing?.(chainName) || {}
  }

  getOfflineSigner(wallet: BaseWallet, chainName: string): OfflineSigner {
    const chain = this.getChain(chainName)
    const signType = this.getPreferSignType(chainName)
    if (signType === 'direct') {
      return wallet.getOfflineSignerDirect(chain.chainId)
    } else {
      return wallet.getOfflineSignerAmino(chain.chainId)
    }
  }

  async createClientFactory(wallet: BaseWallet, chainName: ChainName): Promise<InterchainJsSigner> {
    const rpcEndpoint = await this.getRpcEndpoint(wallet, chainName)
    const offlineSigner = await this.getOfflineSigner(wallet, chainName)
    const signerOptions = await this.getSignerOptions(chainName)
    const preferredSignType = await this.getPreferSignType(chainName)
    return new InterchainJsSigner(rpcEndpoint, offlineSigner, signerOptions, preferredSignType)
  }

}