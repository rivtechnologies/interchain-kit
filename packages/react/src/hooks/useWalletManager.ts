import { WalletManager } from '@interchain-kit/core';

import { useInterChainWalletContext } from "../provider"

export const useWalletManager = (): WalletManager => {
  const { walletManager } = useInterChainWalletContext()
  return walletManager
}