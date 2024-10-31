import { HttpEndpoint } from '@interchainjs/types';
import { useEffect, useState } from "react";
import { useWalletManager } from './useWalletManager';
import { Chain } from '@chain-registry/v2-types';
import { useAccount } from './useAccount';
import { WalletState } from '@interchain-kit/core';
import { SigningClient } from '../types';

export const useInterchainClient = (chainName: string, walletName: string) => {
  const [rpcEndpoint, setRpcEndpoint] = useState<string | HttpEndpoint | undefined>()
  //signing
  const [signingClient, setSigningClient] = useState<SigningClient | null>(null)

  const [error, setError] = useState<string | unknown | null>(null);
  const [isLoading, setIsLoading] = useState(false)
  const walletManager = useWalletManager()
  const account = useAccount(chainName, walletName)
  const wallet = walletManager.wallets.find((w) => w.info.name === walletName)
  const chainToShow = walletManager.chains.find((c: Chain) => c.chainName === chainName)

  const initialize = async () => {
    if (wallet && chainToShow && wallet?.walletState === WalletState.Connected) {
      try {
        setIsLoading(true)

        const rpcEndpoint = await walletManager.getRpcEndpoint(wallet, chainName)
        setRpcEndpoint(rpcEndpoint)

        const signingClient = await walletManager.getSigningClient(walletName, chainName)
        setSigningClient(signingClient)

      } catch (error) {
        setError(error)
        console.log("create client error", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    initialize()
  }, [chainName, walletName, account, wallet?.walletState])

  return {
    rpcEndpoint,
    signingClient,
    error,
    isLoading
  }
}