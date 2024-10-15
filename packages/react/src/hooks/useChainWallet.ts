import { AssetList, Chain } from "@chain-registry/v2-types"
import { useWalletManager } from "./useWalletManager"
import { useAccount } from "./useAccount"
import { BaseWallet } from "@interchain-kit/core"
import { UseChainReturnType } from "../types/chain"
import { useInterchainClient } from "./useInterchainClient"

export const useChainWallet = (chainName: string, walletName: string): UseChainReturnType => {
  const walletManager = useWalletManager()
  const chainToShow = walletManager.chains.find((c: Chain) => c.chainName === chainName)
  const assetList = walletManager.assetLists.find((a: AssetList) => a.chainName === chainName)
  const wallet = walletManager.wallets.find((w: BaseWallet) => w.option.name === walletName)

  const account = useAccount(chainName, walletName)

  const interchainClient = useInterchainClient(chainName, walletName)

  return {
    logoUrl: walletManager.getChainLogoUrl(chainName),
    chain: chainToShow,
    assetList,
    address: account?.address,
    wallet,
    ...interchainClient
  }
}