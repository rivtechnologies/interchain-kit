import { AssetList, Chain } from "@chain-registry/v2-types"
import { useWalletManager } from "./useWalletManager"
import { useAccount } from "./useAccount"
import { useEffect, useState } from "react"
import { BaseWallet, ChainNotExist, CosmJsSigner, WalletNotExist } from "@interChain-kit/core"

export const useChainWallet = (chainName: string, walletName: string) => {
  const walletManager = useWalletManager()
  const chainToShow = walletManager.chains.find((c: Chain) => c.chainName === chainName)
  const assetList = walletManager.assetLists.find((a: AssetList) => a.chainName === chainName)
  const wallet = walletManager.wallets.find((w: BaseWallet) => w.option.name === walletName)

  const account = useAccount(chainName, walletName)

  const [clientFactory, setClientFactory] = useState<CosmJsSigner | undefined>()

  useEffect(() => {
    if (!wallet) {
      throw new WalletNotExist(walletName)
    }
    if (!chainToShow) {
      throw new ChainNotExist(chainName)
    }
    walletManager.createClientFactory(wallet, chainName).then(clientFactory => {
      setClientFactory(clientFactory)
    })
  }, [chainName, walletName, account?.address])


  return {
    chain: chainToShow,
    assetList,
    address: account?.address,
    wallet,
    getRpcEndpoint: () => walletManager.getRpcEndpoint(wallet, chainName),
    getClient: () => clientFactory.getClient(),
    getSigningClient: async () => clientFactory.getSigningClient(),
    getCosmwasmClient: () => clientFactory.getCosmwasmClient(),
    getSigningCosmwasmClient: () => clientFactory.getSigningCosmwasmClient(),
    getSigningStargateClient: () => clientFactory.getSigningStargateClient(),
    getStargateClient: () => clientFactory.getStargateClient(),
  }
}