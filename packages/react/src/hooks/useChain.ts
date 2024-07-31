
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

  const account = useAccount(chainName)

  const activeWallet = useActiveWallet()

  const [client, setClient] = useState<CosmJsSigner | null>(null)
  useEffect(() => {
    walletManager.createClient(activeWallet, chainName).then((client) => {
      setClient(client)
    })
  }, [activeWallet, chainName])

  return {
    chain: chainToShow,
    assetList,
    address: account?.address,
    wallet: activeWallet,
    getRpcEndpoint: () => walletManager.getRpcEndpoint(activeWallet, chainName),
    getStargateClient: () => client?.getStargateClient(),
    getCosmwasmClient: () => client?.getCosmwasmClient(),
    getSigningStargateClient: () => client?.getSigningStargateClient(),
    getSigningCosmwasmClient: () => client?.getSigningCosmwasmClient(),
    getClient: () => client?.getClient(),
    getSigningClient: () => client?.getSigningClient(),
  }
}