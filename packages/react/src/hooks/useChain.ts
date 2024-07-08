import { Chain } from '@chain-registry/v2-types';
import { useWalletManager } from "./useWalletManager"

export const useChain = (chainName: string): Chain => {
    const walletManager = useWalletManager()
    return walletManager.chains.find(chain => chain.chainName === chainName)
}