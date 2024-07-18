import { WalletState } from '@interChain-kit/core';
import { useInterChainWalletContext } from '../provider';
import { useCurrentWallet } from './useCurrentWallet';
import { useAccount } from './useAccount';
export const useConnect = () => {
    // const { walletManager } = useInterChainWalletContext()
    // const activeWallet = useCurrentWallet()
    // const account = useAccount()
    // return {
    //     connect: walletManager.connect,
    //     isConnected: activeWallet.walletState === WalletState.Connected,
    //     account
    // }
    return {}
}