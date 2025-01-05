import { useWalletManager } from "./useWalletManager"
import { useWalletModal } from "../modal"
import { bindAllMethodsToContext } from "../utils/helpers"
import { ChainAccount } from '@interchain-kit/core/chain-account';
import { WalletRepository } from "@interchain-kit/core/wallet-repository";

export const useCurrentWallet = (): WalletRepository => {
  const walletManager = useWalletManager()
  const { open } = useWalletModal()

  // useEffect(() => {
  //   if (!walletManager.currentWalletName && walletManager.state === WalletManagerState.Initialized) {
  //     open()
  //   }
  // }, [walletManager.currentWalletName, walletManager.state])

  const { currentWalletName, currentChainName, getWalletRepositoryByName } = walletManager


  const wallet = getWalletRepositoryByName(currentWalletName)

  if (wallet) {
    return bindAllMethodsToContext(wallet)
  }

  return {} as WalletRepository
}