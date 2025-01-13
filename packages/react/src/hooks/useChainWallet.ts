import { useWalletManager } from "./useWalletManager"
import { UseChainWalletReturnType } from "../types/chain"

export const useChainWallet = (chainName: string, walletName: string): UseChainWalletReturnType => {
  const { assetLists, disconnect, getChainByName, getWalletByName, getChainWalletState, getChainLogoUrl, connect, getSigningClient, getRpcEndpoint, getAccount } = useWalletManager()

  const chain = getChainByName(chainName)

  const wallet = getWalletByName(walletName)

  const assetList = assetLists.find(a => a.chainName === chainName)

  const chainWalletStateToShow = getChainWalletState(walletName, chainName)

  return {
    //for migration cosmos kit
    connect: async () => {
      await connect(walletName, chainName)
      await getAccount(walletName, chainName)
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
    wallet: wallet ? Object.assign({}, wallet, {
      walletState: chainWalletStateToShow?.walletState,
      connect: () => connect(walletName, chainName),
      disconnect: () => disconnect(walletName, chainName),
      getAccount: () => getAccount(walletName, chainName)
    }) : undefined,
    rpcEndpoint: chainWalletStateToShow?.rpcEndpoint,
    getSigningClient: () => getSigningClient(walletName, chainName),
  }
}