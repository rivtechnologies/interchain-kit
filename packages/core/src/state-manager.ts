
import { SigningOptions as InterchainSignerOptions } from '@interchainjs/cosmos/types/signing-client';
import { HttpEndpoint } from '@interchainjs/types';
import { createStore } from "zustand"
import { EndpointOptions, WalletAccount, WalletState } from "./types"
import { immer } from "zustand/middleware/immer";
import { persist } from 'zustand/middleware'
import { AssetList, Chain } from '@chain-registry/v2-types';
import { BaseWallet } from './base-wallet';
import { WritableDraft } from 'immer';

export type ChainWalletState = {
  chainName: string,
  walletName: string,
  walletState: WalletState,
  rpcEndpoint: string | HttpEndpoint
  errorMessage: string
  account: WalletAccount
}

export type InterchainStore = {
  chains: Chain[]
  assetLists: AssetList[]
  wallets: BaseWallet[]
  signerOptions: InterchainSignerOptions[]
  endpointOptions: EndpointOptions[]

  chainWalletState: ChainWalletState[]
  currentWalletName: string
  currentChainName: string

  update: (fn: (draft: WritableDraft<InterchainStore>) => void) => void

  setCurrentChainName: (chainName: string) => void
  setCurrentWalletName: (walletName: string) => void
  getDraftChainWalletState: (walletName: string, chainName: string) => ChainWalletState
  getChainWalletState: (walletName: string, chainName: string) => ChainWalletState
  updateChainWalletState: (walletName: string, chainName: string, data: Partial<ChainWalletState>) => void
  updateChainWalletStateByChainName: (chainName: string, data: Partial<ChainWalletState>) => void
}

export const createInterchainStore = () => {

  const store = createStore<
    InterchainStore,
    [
      ["zustand/persist", { chainWalletState: ChainWalletState[]; currentWalletName: string; currentChainName: string; }],
      ["zustand/immer", never]
    ]
  >(
    persist(
      immer<InterchainStore>((set, get) => ({
        chains: [],
        assetLists: [],
        wallets: [],
        signerOptions: [],
        endpointOptions: [],
        chainWalletState: [],
        currentChainName: "",
        currentWalletName: "",

        update: (fn: (draft: WritableDraft<InterchainStore>) => void) => set(fn),

        setCurrentChainName: (chainName: string) => {
          set(state => {
            state.currentChainName = chainName
          })
        },
        setCurrentWalletName: (walletName: string) => {
          set(state => {
            state.currentWalletName = walletName
          })
        },
        getDraftChainWalletState: (walletName: string, chainName: string) => {
          const state = get()
          const targetIndex = state.chainWalletState.findIndex(cws => cws.walletName === walletName && cws.chainName === chainName)
          return state.chainWalletState[targetIndex]
        },
        getChainWalletState: (walletName: string, chainName: string) => {
          return get().chainWalletState.find(cws => cws.walletName === walletName && cws.chainName === chainName)
        },
        updateChainWalletState: (walletName: string, chainName: string, data: Partial<ChainWalletState>) => {
          set(state => {
            let targetIndex = state.chainWalletState.findIndex(cws => cws.walletName === walletName && cws.chainName === chainName)
            state.chainWalletState[targetIndex] = { ...state.chainWalletState[targetIndex], ...data }
          })
        },
        updateChainWalletStateByChainName: (chainName: string, data: Partial<ChainWalletState>) => {
          set(draft => {
            const indexes: number[] = []
            draft.chainWalletState.forEach((cws, index) => {
              if (cws.chainName === chainName) {
                indexes.push(index)
              }
            })
            indexes.forEach(index => {
              draft.chainWalletState[index] = { ...draft.chainWalletState[index], ...data }
            })
          })
        }
      })),
      {
        name: 'interchain-kit-store',
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
      }
    )
  )



  return store

}



