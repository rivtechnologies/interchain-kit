import { ChainAccount } from "@interchain-kit/core/chain-account";
import { bindAllMethodsToContext } from "../utils/helpers";
import { useWalletManager } from "./useWalletManager";

export const useCurrentChainWallet = () => {
  const walletManager = useWalletManager();
  const { currentChainName, currentWalletName } = walletManager
  const chainWallet = walletManager.getWalletRepositoryByName(currentWalletName)?.getChainAccountByName(currentChainName);
  if (chainWallet) {
    return bindAllMethodsToContext(chainWallet)
  }
  return {} as ChainAccount
}