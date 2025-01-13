
import { useInterchainWalletContext } from "../provider"
import { useStore } from 'zustand';

export const useWalletManager = () => {
  const store = useInterchainWalletContext()
  return useStore(store)
}