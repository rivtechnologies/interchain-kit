import { WalletRepository } from '@interchain-kit/core/wallet-repository';
import { useWalletManager } from "./useWalletManager"
import { useWalletModal } from "../modal"
import { bindAllMethodsToContext } from "../utils/helpers"
import { useEffect } from 'react';
import { WalletManagerState } from '@interchain-kit/core';

export const useCurrentWallet = (): WalletRepository => {
  const walletManager = useWalletManager()
  const { open } = useWalletModal()

  // useEffect(() => {
  //   if (!walletManager.currentWalletName && walletManager.state === WalletManagerState.Initialized) {
  //     open()
  //   }
  // }, [walletManager.currentWalletName, walletManager.state])

  const wallet = walletManager.getCurrentWallet()

  if (wallet) {
    return bindAllMethodsToContext(wallet)
  }

  return {} as WalletRepository
}