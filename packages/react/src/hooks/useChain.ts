
import { useWalletManager } from "./useWalletManager"
import { UseChainReturnType } from '../types/chain';
import { useAccount } from "./useAccount";
import { AssetList, Chain } from "@chain-registry/v2-types";
import { useActiveWallet } from './useActiveWallet';
import { useEffect, useState } from "react";
import { CosmJsSigner } from "@interChain-kit/core";

export const useChain = (chainName: string): UseChainReturnType => {
  const walletManager = useWalletManager()
  const chainToShow = walletManager.chains.find((c: Chain) => c.chainName === chainName)
  const assetList = walletManager.assetLists.find((a: AssetList) => a.chainName === chainName)

  const activeWallet = useActiveWallet()

  const account = useAccount(chainName, activeWallet.option.name)

  const [clientFactory, setClientFactory] = useState<CosmJsSigner | undefined>()

  useEffect(() => {
    walletManager.createClientFactory(activeWallet, chainName).then(clientFactory => {
      setClientFactory(clientFactory)
    })
  }, [chainName, activeWallet, account?.address])


  return {
    chain: chainToShow,
    assetList,
    address: account?.address,
    wallet: activeWallet,
    getRpcEndpoint: () => walletManager.getRpcEndpoint(activeWallet, chainName),
    getClient: () => clientFactory.getClient(),
    getSigningClient: () => clientFactory.getSigningClient(),
    getCosmwasmClient: () => clientFactory.getCosmwasmClient(),
    getSigningCosmwasmClient: () => clientFactory.getSigningCosmwasmClient(),
    getSigningStargateClient: () => clientFactory.getSigningStargateClient(),
    getStargateClient: () => clientFactory.getStargateClient(),
  }
}