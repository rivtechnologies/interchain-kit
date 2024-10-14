import { useWalletManager } from './useWalletManager';
import { AssetList, Chain } from "@chain-registry/v2-types";
import { getChainLogoUrl } from "../utils";
import { inject } from 'vue'
import { useCurrentWallet } from './useCurrentWallet';

export const useChain = (chainName: string) => {
  const walletManager = useWalletManager();
  const chainToShow = walletManager.chains.find((c: Chain) => c.chainName === chainName);
  const assetList = walletManager.assetLists.find((a: AssetList) => a.chainName === chainName);
  const connect = inject<() => void>('openModal');
  const currentWallet = useCurrentWallet()

  return {
    logoUrl: getChainLogoUrl(assetList),
    chain: chainToShow,
    assetList,
    connect,
    wallet: currentWallet
    // address: account?.address,
    // wallet: currentWallet,
    // ...cosmosKitUserChainReturnType, //for migration cosmos kit
    // ...interchainClient
  };
};

