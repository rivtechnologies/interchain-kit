import { WalletManager } from '@interchain-kit/core';

import { useInterchainWalletContext } from "../provider"

export const useWalletManager = (): WalletManager => {
  const { walletManager } = useInterchainWalletContext()
  return walletManager
}