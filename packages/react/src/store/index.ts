import { AssetList, Chain } from "@chain-registry/v2-types"
import { BaseWallet, clientNotExistError, EndpointOptions, Endpoints, SignerOptions, SignType, Wallet, WalletAccount, WalletManager, WalletState } from "@interchain-kit/core"
import { SigningOptions as InterchainSignerOptions } from '@interchainjs/cosmos/types/signing-client';
import { HttpEndpoint } from '@interchainjs/types';
import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from 'zustand/middleware'

const immerSyncUp = (newWalletManager: WalletManager) => {
  return (draft: { chains: Chain[]; assetLists: AssetList[]; wallets: BaseWallet[]; signerOptions: SignerOptions; endpointOptions: EndpointOptions; signerOptionMap: Record<string, InterchainSignerOptions>; endpointOptionsMap: Record<string, Endpoints>; preferredSignTypeMap: Record<string, SignType>; }) => {
    draft.chains = newWalletManager.chains
    draft.assetLists = newWalletManager.assetLists
    draft.wallets = newWalletManager.wallets
    draft.signerOptions = newWalletManager.signerOptions
    draft.endpointOptions = newWalletManager.endpointOptions
    draft.signerOptionMap = newWalletManager.signerOptionMap
    draft.endpointOptionsMap = newWalletManager.endpointOptionsMap
    draft.preferredSignTypeMap = newWalletManager.preferredSignTypeMap
  }
}

type ChainWalletState = {
  chainName: string,
  walletName: string,
  walletState: WalletState,
  rpcEndpoint: string | HttpEndpoint
  errorMessage: string
  account: WalletAccount
}

export interface InterchainStore extends WalletManager {
  chainWalletState: ChainWalletState[]
  currentWalletName: string
  currentChainName: string
  setCurrentChainName: (chainName: string) => void
  setCurrentWalletName: (walletName: string) => void
  getDraftChainWalletState: (state: InterchainStore, walletName: string, chainName: string) => ChainWalletState
  getChainWalletState: (walletName: string, chainName: string) => ChainWalletState | undefined
  updateChainWalletState: (walletName: string, chainName: string, data: Partial<ChainWalletState>) => void
}

export type InterchainStoreData = {
  chains: Chain[]
  assetLists: AssetList[]
  wallets: BaseWallet[]
  signerOptions: SignerOptions
  endpointOptions: EndpointOptions
}

export const createInterchainStore = (walletManager: WalletManager) => {

  const { chains, assetLists, wallets, signerOptions, endpointOptions } = walletManager
  // const walletManager = new WalletManager(chains, assetLists, wallets, signerOptions, endpointOptions)


  return createStore(persist(immer<InterchainStore>((set, get) => ({
    chainWalletState: [],
    currentWalletName: '',
    currentChainName: '',
    chains: [...walletManager.chains],
    assetLists: [...walletManager.assetLists],
    wallets: walletManager.wallets,
    signerOptions: walletManager.signerOptions,
    endpointOptions: walletManager.endpointOptions,

    preferredSignTypeMap: { ...walletManager.preferredSignTypeMap },
    signerOptionMap: { ...walletManager.signerOptionMap },
    endpointOptionsMap: { ...walletManager.endpointOptionsMap },

    updateChainWalletState: (walletName: string, chainName: string, data: Partial<ChainWalletState>) => {
      set(draft => {
        let targetIndex = draft.chainWalletState.findIndex(cws => cws.walletName === walletName && cws.chainName === chainName)
        draft.chainWalletState[targetIndex] = { ...draft.chainWalletState[targetIndex], ...data }
      })
    },

    init: async () => {
      const existedChainWalletStatesMap = new Map(get().chainWalletState.map(cws => [cws.walletName + cws.chainName, cws]))
      wallets.forEach(wallet => {
        chains.forEach(chain => {
          if (!existedChainWalletStatesMap.has(wallet.info.name + chain.chainName)) {
            set(draft => {
              draft.chainWalletState.push({
                chainName: chain.chainName,
                walletName: wallet.info.name,
                walletState: WalletState.Disconnected,
                rpcEndpoint: "",
                errorMessage: "",
                account: undefined
              })
            })
          }
        })
      })

      const NotExistWallets: string[] = []
      await Promise.all(get().wallets.map(async wallet => {
        try {
          await wallet.init()
        } catch (error) {
          if (error === clientNotExistError.message) {
            NotExistWallets.push(wallet.info.name)
          }
        }
      }))
      set(draft => {
        draft.chainWalletState = draft.chainWalletState.map(cws => {
          if (NotExistWallets.includes(cws.walletName)) {
            return { ...cws, walletState: WalletState.NotExist }
          }
          return cws
        })
      })
      // return walletManager.init()
    },

    setCurrentChainName: (chainName: string) => {
      set(draft => { draft.currentChainName = chainName })
    },

    setCurrentWalletName: (walletName: string) => {
      set(draft => { draft.currentWalletName = walletName })
    },

    getDraftChainWalletState: (state: InterchainStore, walletName: string, chainName: string) => {
      const targetIndex = state.chainWalletState.findIndex(cws => cws.walletName === walletName && cws.chainName === chainName)
      return state.chainWalletState[targetIndex]
    },

    getChainWalletState: (walletName: string, chainName: string) => {
      return get().chainWalletState.find(cws => cws.walletName === walletName && cws.chainName === chainName)
    },

    addChains: (chains: Chain[], assetLists: AssetList[], signerOptions: SignerOptions, endpointOptions: EndpointOptions) => {
      walletManager.addChains(chains, assetLists, signerOptions, endpointOptions)
      // console.log(walletManager.chains, walletManager.assetLists)
      // set(immerSyncUp(walletManager))
      // set(draft => {
      //   draft.chains = walletManager.chains
      // })
      set(draft => {
        chains.forEach(newChain => {
          const existChain = draft.chains.find(c => c.chainId === newChain.chainId)
          if (!existChain) {
            draft.chains.push(newChain)
            const assetList = assetLists.find(a => a.chainName === newChain.chainName)
            draft.assetLists.push(assetList)

            draft.wallets.forEach(w => {
              draft.chainWalletState.push({
                chainName: newChain.chainName,
                walletName: w.info.name,
                walletState: WalletState.Disconnected,
                rpcEndpoint: "",
                errorMessage: "",
                account: undefined
              })
            })
          }

          draft.signerOptionMap[newChain.chainName] = signerOptions?.signing?.(newChain.chainName)
          draft.endpointOptionsMap[newChain.chainName] = endpointOptions?.endpoints?.[newChain.chainName]
        })
      })

    },

    connect: async (walletName: string, chainName: string) => {
      get().updateChainWalletState(walletName, chainName, { walletState: WalletState.Connecting })
      try {
        await walletManager.connect(walletName, chainName)
        set(draft => {
          draft.currentChainName = chainName
          draft.currentWalletName = walletName
        })
        get().updateChainWalletState(walletName, chainName, { walletState: WalletState.Connected })
      } catch (error) {
        if ((error as any).message === 'Request rejected') {
          get().updateChainWalletState(walletName, chainName, { walletState: WalletState.Rejected, errorMessage: (error as any).message })
          return
        }
        get().updateChainWalletState(walletName, chainName, { walletState: WalletState.Disconnected, errorMessage: (error as any).message })
      }
    },
    disconnect: async (walletName: string, chainName: string) => {
      try {
        await walletManager.disconnect(walletName, chainName)
        get().updateChainWalletState(walletName, chainName, { walletState: WalletState.Disconnected, account: null })
      } catch (error) {

      }
    },
    getAccount: async (walletName: string, chainName: string) => {
      const account = await walletManager.getAccount(walletName, chainName)
      get().updateChainWalletState(walletName, chainName, { account })
      return account
    },
    getRpcEndpoint: async (walletName: string, chainName: string) => {
      const exist = get().getChainWalletState(walletName, chainName).rpcEndpoint
      if (exist) return exist
      const rpcEndpoint = await walletManager.getRpcEndpoint(walletName, chainName)
      get().updateChainWalletState(walletName, chainName, { rpcEndpoint })
      return rpcEndpoint
    },
    getChainLogoUrl(chainName) {
      return walletManager.getChainLogoUrl(chainName)
    },
    getChainByName(chainName) {
      return walletManager.getChainByName(chainName)
    },
    getAssetListByName(chainName) {
      return walletManager.getAssetListByName(chainName)
    },
    getDownloadLink(walletName) {
      return walletManager.getDownloadLink(walletName)
    },
    getOfflineSigner(walletName, chainName) {
      return walletManager.getOfflineSigner(walletName, chainName)
    },
    getPreferSignType(chainName) {
      const result = walletManager.getPreferSignType(chainName)
      set(immerSyncUp(walletManager))
      return result
    },
    getSignerOptions(chainName) {
      const result = walletManager.getSignerOptions(chainName)
      set(immerSyncUp(walletManager))
      return result
    },
    getWalletByName(walletName) {
      return walletManager.getWalletByName(walletName)
    },
    getSigningClient(walletName, chainName) {
      return walletManager.getSigningClient(walletName, chainName)
    },
    getEnv() {
      return walletManager.getEnv()
    },
  })), {
    name: 'interchain-kit-store',
    storage: createJSONStorage(() => localStorage),
    partialize: state => ({
      chainWalletState: state.chainWalletState,
      currentWalletName: state.currentWalletName,
      currentChainName: state.currentChainName
    }),
    onRehydrateStorage: (state) => {
      console.log('interchain-kit store hydration starts')

      // optional
      return (state, error) => {
        if (error) {
          console.log('an error happened during hydration', error)
        } else {
          console.log('interchain-kit store hydration finished')
        }
      }
    },
  }))

}

