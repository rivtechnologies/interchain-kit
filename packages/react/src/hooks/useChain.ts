import { UseChainReturnType } from '../types/chain';
import { useWalletModal } from "../modal";
import { useWalletManager } from './useWalletManager';
import { ChainNameNotExist } from '@interchain-kit/core';
import { useSigningClient } from './useSigningClient';
import { decorateWallet } from '../utils/decorateWallet';

export const useChain = (chainName: string): UseChainReturnType => {

  const { assetLists, currentWalletName, disconnect, setCurrentChainName, getChainByName, getWalletByName, getChainWalletState, getChainLogoUrl, connect, getSigningClient, getRpcEndpoint, getAccount } = useWalletManager()

  const chain = getChainByName(chainName)

  if (!chain) {
    throw new ChainNameNotExist(chainName)
  }

  const assetList = assetLists.find(a => a.chainName === chainName)
  const wallet = getWalletByName(currentWalletName)

  const chainWalletStateToShow = getChainWalletState(currentWalletName, chainName)
  const { open, close } = useWalletModal()

  const { signingClient, isLoading: isSigningClientLoading, error: signingClientError } = useSigningClient(chainName, currentWalletName)

  return {
    //for migration cosmos kit
    connect: () => {
      setCurrentChainName(chainName)
      open()
    },
    disconnect: async () => disconnect(currentWalletName, chainName),
    openView: () => {
      setCurrentChainName(chainName)
      open()
    },
    closeView: close,
    getRpcEndpoint: () => getRpcEndpoint(currentWalletName, chainName),
    status: chainWalletStateToShow?.walletState,
    username: chainWalletStateToShow?.account?.username,
    message: chainWalletStateToShow?.errorMessage,

    // new api
    logoUrl: getChainLogoUrl(chainName),
    chain,
    assetList,
    address: chainWalletStateToShow?.account?.address,
    wallet,

    getSigningClient: () => getSigningClient(currentWalletName, chainName),

    signingClient,
    isSigningClientLoading,
    signingClientError,

    rpcEndpoint: chainWalletStateToShow?.rpcEndpoint,

  }
}
