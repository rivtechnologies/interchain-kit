import { useWalletManager } from './useWalletManager';
import { AssetList, Chain } from "@chain-registry/v2-types";
import { getChainLogoUrl } from "../utils";
import { inject, watch, ref } from 'vue'
import { useCurrentWallet } from './useCurrentWallet';
import { useAccount } from './useAccount';

export const useChain = (chainName: string) => {
  const walletManager = useWalletManager();
  const chainToShow = walletManager.chains.find((c: Chain) => c.chainName === chainName);
  const assetList = walletManager.assetLists.find((a: AssetList) => a.chainName === chainName);
  const connect = inject<() => void>('openModal');
  const currentWallet = useCurrentWallet()
  const account = useAccount(chainName, currentWallet?.option?.name)
  const address = ref('')

  watch(account, (newValue, oldValue) => {
    // console.log(`count from ${oldValue} to ${newValue}`);
    console.log('newAccount', newValue)
    address.value = newValue?.address
  }
  )

  const disconnect = () => {
    console.log('disconnect', currentWallet?.option?.name)
    walletManager.disconnect(currentWallet?.option?.name)
  }

  return {
    logoUrl: getChainLogoUrl(assetList),
    chain: chainToShow,
    assetList,
    connect,
    disconnect,
    wallet: currentWallet,
    account,
    // address: account?.address,
    // wallet: currentWallet,
    // ...cosmosKitUserChainReturnType, //for migration cosmos kit
    // ...interchainClient
  };
};

