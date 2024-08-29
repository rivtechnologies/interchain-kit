import { useWalletManager } from "./useWalletManager"
import { UseChainReturnType } from '../types/chain';
import { useAccount } from "./useAccount";
import { AssetList, Chain } from "@chain-registry/v2-types";
import { useActiveWallet } from './useActiveWallet';
import { useInterchainClient } from './useInterchainClient';

export const useChain = (chainName: string): UseChainReturnType => {
  const walletManager = useWalletManager()
  const chainToShow = walletManager.chains.find((c: Chain) => c.chainName === chainName)
  const assetList = walletManager.assetLists.find((a: AssetList) => a.chainName === chainName)

  const activeWallet = useActiveWallet()

  const account = useAccount(chainName, activeWallet.option.name)

  const interchainClient = useInterchainClient(chainName, activeWallet.option.name)

  return {
    chain: chainToShow,
    assetList,
    address: account?.address,
    wallet: activeWallet,
    ...interchainClient
  }
}