import { AminoGenericOfflineSigner, DirectGenericOfflineSigner } from '@interchainjs/cosmos/types/wallet';
import { HttpEndpoint } from '@interchainjs/types';
import { Chain, AssetList } from '@chain-registry/v2-types'
import { BaseWallet } from './base-wallet'
import { ChainName, DeviceType, DownloadInfo, EndpointOptions, Endpoints, OS, SignerOptions, SignType } from './types'
import { SignerOptions as InterchainSignerOptions } from '@interchainjs/cosmos/types/signing-client';
import { SigningClient } from '@interchainjs/cosmos/signing-client'
import Bowser from 'bowser';
import { ChainNameNotExist, ChainNotExist, getValidRpcEndpoint, NoValidRpcEndpointFound, WalletNotExist } from './utils';

export class WalletManager {
  chains: Chain[] = []
  assetLists: AssetList[] = []
  wallets: BaseWallet[] = []
  signerOptions: SignerOptions | undefined
  endpointOptions: EndpointOptions | undefined

  preferredSignTypeMap: Record<Chain['chainName'], SignType> = {}
  signerOptionMap: Record<Chain['chainName'], InterchainSignerOptions> = {}
  endpointOptionsMap: Record<Chain['chainName'], Endpoints> = {}

  constructor(
    chains: Chain[],
    assetLists: AssetList[],
    wallets: BaseWallet[],
    signerOptions?: SignerOptions,
    endpointOptions?: EndpointOptions,
  ) {
    this.chains = chains
    this.assetLists = assetLists
    this.wallets = wallets

    this.signerOptions = signerOptions
    this.endpointOptions = endpointOptions

    this.chains.forEach(chain => {
      this.signerOptionMap[chain.chainName] = signerOptions?.signing?.(chain.chainName)
    })
  }

  async init() {
    await Promise.all(this.wallets.map(async (wallet) => wallet.init()))
  }

  static async create(
    chain: Chain[],
    assetLists: AssetList[],
    wallets: BaseWallet[],
    signerOptions?: SignerOptions,
    endpointOptions?: EndpointOptions
  ) {
    const wm = new WalletManager(chain, assetLists, wallets, signerOptions, endpointOptions)
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
      }

      this.signerOptionMap[newChain.chainName] = signerOptions?.signing?.(newChain.chainName)
      this.endpointOptionsMap[newChain.chainName] = endpointOptions?.endpoints?.[newChain.chainName]
    })
  }

  getChainLogoUrl(chainName: ChainName) {
    const assetList = this.assetLists.find(assetList => assetList.chainName === chainName)
    return assetList?.assets?.[0].logoURIs?.png || assetList?.assets?.[0].logoURIs?.svg || undefined
  }

  getWalletByName(walletName: string): BaseWallet | undefined {
    return this.wallets.find(w => w.info.name === walletName)
  }

  getChainByName(chainName: string): Chain | undefined {
    const chain = this.chains.find(chain => chain.chainName === chainName)
    return chain
  }

  getAssetListByName(chainName: string) {
    return this.assetLists.find(assetList => assetList.chainName === chainName)
  }

  async connect(walletName: string, chainName: string) {
    const wallet = this.getWalletByName(walletName)
    const chain = this.getChainByName(chainName)

    if (!wallet) {
      throw new WalletNotExist(walletName)
    }

    if (!chain) {
      throw new ChainNameNotExist(chainName)
    }
    try {
      await wallet.connect(chain.chainId)
    } catch (error) {
      if ((error as any).message !== 'Request rejected') {
        await wallet.addSuggestChain(chain, this.assetLists)
      } else {
        throw error
      }
    }
  }

  disconnect(walletName: string, chainName: string) {
    const wallet = this.getWalletByName(walletName)
    const chain = this.getChainByName(chainName)

    if (!wallet) {
      throw new WalletNotExist(walletName)
    }

    if (!chain) {
      throw new ChainNameNotExist(chainName)
    }
    return wallet.disconnect(chain.chainId)
  }

  getAccount(walletName: string, chainName: string) {
    const wallet = this.getWalletByName(walletName)
    const chain = this.getChainByName(chainName)
    if (!wallet) {
      throw new WalletNotExist(walletName)
    }

    if (!chain) {
      throw new ChainNameNotExist(chainName)
    }
    return wallet.getAccount(chain.chainId)
  }

  getRpcEndpoint = async (walletName: string, chainName: string) => {
    const existRpcEndpoint = this.endpointOptionsMap?.[chainName]?.rpc?.[0]
    if (existRpcEndpoint) {
      return existRpcEndpoint
    }

    const chain = this.getChainByName(chainName)

    let rpcEndpoint: string | HttpEndpoint = ''
    const providerRpcEndpoints = this.endpointOptions?.endpoints[chain.chainName]?.rpc || []
    // const walletRpcEndpoints = wallet?.info?.endpoints?.[chain.chainName]?.rpc || []
    const chainRpcEndpoints = chain.apis.rpc.map(url => url.address)

    if (providerRpcEndpoints?.[0]) {
      rpcEndpoint = providerRpcEndpoints[0]
      this.endpointOptionsMap?.[chainName]?.rpc.push(rpcEndpoint)
      return rpcEndpoint
    }

    const validRpcEndpoint = await getValidRpcEndpoint([...providerRpcEndpoints, ...chainRpcEndpoints])

    if (validRpcEndpoint === '') {
      throw new NoValidRpcEndpointFound()
    }

    rpcEndpoint = validRpcEndpoint
    this.endpointOptionsMap?.[chainName]?.rpc.push(rpcEndpoint)
    return rpcEndpoint
  }

  getPreferSignType(chainName: string) {
    return this.preferredSignTypeMap[chainName] || 'amino'
  }

  getSignerOptions(chainName: string): InterchainSignerOptions {
    const signerOptions = this.signerOptionMap[chainName]
    const chain = this.getChainByName(chainName)
    const options: InterchainSignerOptions = {
      prefix: chain.bech32Prefix,
      broadcast: {
        checkTx: true,
        deliverTx: false,
      },
      ...signerOptions,
    }
    return options
  }

  async getOfflineSigner(walletName: string, chainName: string) {
    const preferredSignType = this.getPreferSignType(chainName)

    const wallet = this.getWalletByName(walletName)
    const chain = this.getChainByName(chainName)
    if (!wallet) {
      throw new WalletNotExist(walletName)
    }
    if (!chain) {
      throw new ChainNotExist(chainName)
    }
    if (preferredSignType === 'amino') {
      return new AminoGenericOfflineSigner(wallet.getOfflineSignerAmino(chain.chainId))
    } else {
      return new DirectGenericOfflineSigner(wallet.getOfflineSignerDirect(chain.chainId))
    }
  }

  async getSigningClient(walletName: string, chainName: ChainName): Promise<SigningClient> {
    const rpcEndpoint = await this.getRpcEndpoint(walletName, chainName)
    const offlineSigner = await this.getOfflineSigner(walletName, chainName)
    const signerOptions = await this.getSignerOptions(chainName)
    return SigningClient.connectWithSigner(rpcEndpoint, offlineSigner, signerOptions)
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