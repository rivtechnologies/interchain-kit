import { useWalletManager } from "./useWalletManager"
import { UseChainWalletReturnType } from "../types/chain"
import { useSigningClient } from "./useSigningClient"
import { decorateWallet } from "../utils/decorateWallet"

export const useChainWallet = (chainName: string, walletName: string): UseChainWalletReturnType => {
  const { assetLists, disconnect, setCurrentChainName, setCurrentWalletName, getChainByName, getWalletByName, getChainWalletState, getChainLogoUrl, connect, getSigningClient, getRpcEndpoint, getAccount } = useWalletManager()

  const chain = getChainByName(chainName)

  const wallet = getWalletByName(walletName)

  const assetList = assetLists.find(a => a.chainName === chainName)

  const chainWalletStateToShow = getChainWalletState(walletName, chainName)

  const { signingClient, isLoading: isSigningClientLoading, error: signingClientError } = useSigningClient(chainName, walletName)

  return {
    //for migration cosmos kit
    connect: async () => {
      setCurrentWalletName(walletName)
      setCurrentChainName(chainName)
      await connect(walletName, chainName)
    },
    disconnect: () => disconnect(walletName, chainName),
    getRpcEndpoint: () => getRpcEndpoint(walletName, chainName),
    status: chainWalletStateToShow?.walletState,
    username: chainWalletStateToShow?.account?.username,
    message: chainWalletStateToShow?.errorMessage,

    // new api
    logoUrl: getChainLogoUrl(chainName),
    chain,
    assetList,
    address: chainWalletStateToShow?.account?.address,
    wallet: wallet ? decorateWallet(wallet, {
      connect: () => connect(walletName, chainName),
      disconnect: () => disconnect(walletName, chainName),
      getAccount: () => getAccount(walletName, chainName),
    }) : null,

    getSigningClient: () => getSigningClient(walletName, chainName),

    signingClient,
    isSigningClientLoading,
    signingClientError,

    rpcEndpoint: chainWalletStateToShow?.rpcEndpoint,
  }
}