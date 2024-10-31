import { AssetList, Chain } from "@chain-registry/v2-types"
import { useWalletManager } from "./useWalletManager"
import { useAccount } from "./useAccount"
import { BaseWallet, ChainNotExist, WalletNotExist, WalletState } from "@interchain-kit/core"
import { UseChainWalletReturnType } from "../types/chain"
import { useInterchainClient } from "./useInterchainClient"
import { useCallback } from "react"

export const useChainWallet = (chainName: string, walletName: string): UseChainWalletReturnType => {
  const walletManager = useWalletManager()
  const chainToShow = walletManager.chains.find((c: Chain) => c.chainName === chainName)
  const assetList = walletManager.assetLists.find((a: AssetList) => a.chainName === chainName)
  const wallet = walletManager.wallets.find((w: BaseWallet) => w.info.name === walletName)

  const account = useAccount(chainName, walletName)

  const interchainClient = useInterchainClient(chainName, walletName)

  const connect = useCallback(() => {
    if (!wallet) {
      const error = new WalletNotExist(walletName)
      console.error(error.message)
      return
    }

    if (!chainToShow) {
      const error = new ChainNotExist(chainName)
      console.error(error.message)
      return
    }

    if (wallet.walletState !== WalletState.Connected) {
      walletManager.connect(wallet.info.name)
    }
  }, [chainName, walletName])

  const disconnect = useCallback(() => {
    if (wallet.walletState === WalletState.Connected) {
      walletManager.disconnect(wallet.info.name)
    }
  }, [chainName, walletName])

  const getRpcEndpoint = useCallback(async () => {
    return walletManager.getRpcEndpoint(wallet, chainName)
  }, [])

  return {
    connect,
    disconnect,
    getRpcEndpoint,
    status: wallet?.walletState,
    username: account?.username,
    message: wallet?.errorMessage,
    logoUrl: walletManager.getChainLogoUrl(chainName),
    chain: chainToShow,
    assetList,
    address: account?.address,
    wallet,
    ...interchainClient
  }
}