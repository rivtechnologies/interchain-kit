import { UseChainReturnType } from '../types/chain';
import { useWalletModal } from "../modal";
import { useWalletManager } from './useWalletManager';
import { ChainNameNotExist } from '@interchain-kit/core';

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

  console.log({ chainName, chain })

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
    wallet: wallet ? Object.assign({}, wallet, {
      walletState: chainWalletStateToShow?.walletState,
      connect: () => connect(currentWalletName, chainName),
      getAccount: () => getAccount(currentWalletName, chainName)
    }) : undefined,
    rpcEndpoint: chainWalletStateToShow?.rpcEndpoint,
    getSigningClient: () => getSigningClient(currentWalletName, chainName),
  }

}