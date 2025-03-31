import { useWalletManager } from "./useWalletManager"
import { UseChainWalletReturnType } from "../types/chain"
import { ChainWallet } from "../store/chain-wallet"

export const useChainWallet = (chainName: string, walletName: string): UseChainWalletReturnType => {
  const { assetLists, disconnect, setCurrentChainName, setCurrentWalletName, getChainByName, getWalletByName, getChainWalletState, getChainLogoUrl, connect, getSigningClient, getRpcEndpoint, getAccount } = useWalletManager()

  const chain = getChainByName(chainName)

  const wallet = getWalletByName(walletName)

  const assetList = assetLists.find(a => a.chainName === chainName)

  const chainWalletStateToShow = getChainWalletState(walletName, chainName)

  return {
    //for migration cosmos kit
    connect: async () => {
      setCurrentWalletName(walletName)
      setCurrentChainName(chainName)
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
    wallet: wallet ? new ChainWallet(wallet, () => connect(walletName, chainName), () => disconnect(walletName, chainName), () => getAccount(walletName, chainName)) : null,
    rpcEndpoint: chainWalletStateToShow?.rpcEndpoint,
    getSigningClient: () => getSigningClient(walletName, chainName),
  }
}