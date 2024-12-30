import { WalletManager } from '@interchain-kit/core';

import { useInterchainWalletContext } from "../provider"
import { bindAllMethodsToContext } from '../utils/helpers';

export const useWalletManager = (): WalletManager => {
  const { walletManager } = useInterchainWalletContext()
  return bindAllMethodsToContext(walletManager)
}