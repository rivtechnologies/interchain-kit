import { AminoGenericOfflineSigner, DirectGenericOfflineSigner } from '@interchainjs/cosmos/types/wallet';
import { HttpEndpoint } from '@interchainjs/types';
import { Chain, AssetList } from '@chain-registry/v2-types'
import { BaseWallet } from './base-wallet'
import { ChainName, DeviceType, DownloadInfo, EndpointOptions, Endpoints, OS, SignerOptions, SignType, WalletState } from './types'
import { SigningOptions as InterchainSignerOptions } from '@interchainjs/cosmos/types/signing-client';
import { SigningClient } from '@interchainjs/cosmos/signing-client'
import Bowser from 'bowser';
import { ChainNameNotExist, ChainNotExist, clientNotExistError, getValidRpcEndpoint, NoValidRpcEndpointFound, WalletNotExist } from './utils';
import { ChainWalletState, createInterchainStore } from './state-manager';


export class WalletManager {
  chains: Chain[] = []
  assetLists: AssetList[] = []
  wallets: BaseWallet[] = []
  signerOptions: SignerOptions | undefined
  endpointOptions: EndpointOptions | undefined

  preferredSignTypeMap: Record<Chain['chainName'], SignType> = {}
  signerOptionMap: Record<Chain['chainName'], InterchainSignerOptions> = {}
  endpointOptionsMap: Record<Chain['chainName'], Endpoints> = {}

  store = createInterchainStore()

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
      this.preferredSignTypeMap[chain.chainName] = signerOptions?.preferredSignType?.(chain.chainName)
      this.signerOptionMap[chain.chainName] = signerOptions?.signing?.(chain.chainName)
    })

    const existedChainWalletStateMap = new Map(this.store.getState().chainWalletState.map(cws => [cws.chainName + cws.walletName, cws]))

    const newChainWalletStates: ChainWalletState[] = []

    wallets.forEach(wallet => {
      chains.forEach(chain => {
        if (!existedChainWalletStateMap.has(chain.chainName + wallet.info.name)) {
          newChainWalletStates.push({
            chainName: chain.chainName,
            walletName: wallet.info.name,
            walletState: WalletState.Disconnected,
            rpcEndpoint: "",
            errorMessage: "",
            account: undefined
          })
        }
      })
    })

    this.store.getState().update(draft => {
      draft.chains = chains
      draft.assetLists = assetLists
      draft.wallets = wallets

      draft.chainWalletState = [...draft.chainWalletState, ...newChainWalletStates]
    })
  }

  async init() {
    const NotExistWallets: string[] = []
    await Promise.all(this.wallets.map(async (wallet) => {
      try {
        await wallet.init()
      } catch (error) {
        if ((error as any).message === clientNotExistError.message) {
          NotExistWallets.push(wallet.info.name)
        }
      }
    }))
    this.store.getState().update(draft => {
      draft.chainWalletState = draft.chainWalletState.map(cws => {
        if (NotExistWallets.includes(cws.walletName)) {
          return { ...cws, walletState: WalletState.NotExist }
        }
        return cws
      })
    })
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
    chains.forEach(newChain => {
      const existChain = this.chains.find(c => c.chainId === newChain.chainId)
      if (!existChain) {
        this.chains = [...this.chains, newChain]
        const assetList = assetLists.find(a => a.chainName === newChain.chainName)
        this.assetLists = [...this.assetLists, assetList]

        this.store.getState().update(draft => {
          draft.chains = [...draft.chains, newChain]
          draft.assetLists = [...draft.assetLists, assetList]

          draft.wallets.forEach(wallet => {
            const updated: ChainWalletState = {
              chainName: newChain.chainName,
              walletName: wallet.info.name,
              walletState: WalletState.Disconnected,
              rpcEndpoint: endpointOptions?.endpoints[newChain.chainName]?.rpc?.[0] || newChain.apis.rpc[0].address,
              errorMessage: "",
              account: undefined
            }

            let existed = draft.chainWalletState.find(cws => cws.chainName === newChain.chainName && cws.walletName === wallet.info.name)
            if (existed) {
              existed = { ...existed, ...updated }
              return
            }
            draft.chainWalletState = [...draft.chainWalletState, updated]
          })
        })

        this.store.getState().updateChainWalletStateByChainName(newChain.chainName, {
          rpcEndpoint: endpointOptions?.endpoints[newChain.chainName]?.rpc?.[0]
        })

        this.preferredSignTypeMap[newChain.chainName] = signerOptions?.preferredSignType?.(newChain.chainName)
        this.signerOptionMap[newChain.chainName] = signerOptions?.signing(newChain.chainName)
      }
    })
  }

  getChainWalletState(walletName: string, chainName: string) {
    return this.store.getState().chainWalletState.find(cws => cws.walletName === walletName && cws.chainName === chainName)
  }

  setCurrentChainName(chainName: string) {
    this.store.getState().update(draft => {
      draft.currentChainName = chainName
    })
  }

  get currentChainName() {
    return this.store.getState().currentChainName
  }

  setCurrentWalletName(walletName: string) {
    this.store.getState().update(draft => {
      draft.currentWalletName = walletName
    })
  }

  get currentWalletName() {
    return this.store.getState().currentWalletName
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

    this.store.getState().updateChainWalletState(walletName, chainName, { walletState: WalletState.Connecting })
    try {
      await wallet.connect(chain.chainId)

      this.store.getState().updateChainWalletState(walletName, chainName, { walletState: WalletState.Connected })
    } catch (error) {

      if ((error as any).message !== 'Request rejected') {
        await wallet.addSuggestChain(chain, this.assetLists)
      } else {
        this.store.getState().updateChainWalletState(walletName, chainName, { walletState: WalletState.Disconnected, errorMessage: (error as any).message })
        throw error
      }
    }
  }

  async disconnect(walletName: string, chainName: string) {
    const wallet = this.getWalletByName(walletName)
    const chain = this.getChainByName(chainName)

    if (!wallet) {
      throw new WalletNotExist(walletName)
    }

    if (!chain) {
      throw new ChainNameNotExist(chainName)
    }
    try {
      await wallet.disconnect(chain.chainId)
      this.store.getState().updateChainWalletState(walletName, chainName, { walletState: WalletState.Disconnected })
    } catch (error) {

    }

  }

  async getAccount(walletName: string, chainName: string) {
    const wallet = this.getWalletByName(walletName)
    const chain = this.getChainByName(chainName)
    if (!wallet) {
      throw new WalletNotExist(walletName)
    }

    if (!chain) {
      throw new ChainNameNotExist(chainName)
    }
    const account = await wallet.getAccount(chain.chainId)
    this.store.getState().updateChainWalletState(walletName, chainName, { account })
    return account
  }

  async getRpcEndpoint(walletName: string, chainName: string) {
    const existRpcEndpoint = this.store.getState().chainWalletState.find(cws => cws.chainName === chainName)?.rpcEndpoint
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
      this.store.getState().updateChainWalletStateByChainName(chainName, { rpcEndpoint })
      return rpcEndpoint
    }

    const validRpcEndpoint = await getValidRpcEndpoint([...providerRpcEndpoints, ...chainRpcEndpoints])

    if (validRpcEndpoint === '') {
      throw new NoValidRpcEndpointFound()
    }

    rpcEndpoint = validRpcEndpoint
    this.store.getState().updateChainWalletStateByChainName(chainName, { rpcEndpoint })
    return rpcEndpoint
  }

  getPreferSignType(chainName: string) {
    return this.preferredSignTypeMap[chainName] || 'direct'
  }

  getSignerOptions(chainName: string): InterchainSignerOptions {
    const signerOptions = this.signerOptionMap[chainName]
    const options: InterchainSignerOptions = {
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