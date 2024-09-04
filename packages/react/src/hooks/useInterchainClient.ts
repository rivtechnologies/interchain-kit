import { HttpEndpoint } from '@interchainjs/types';
import { CosmWasmSigningClient } from 'interchainjs/cosmwasm-stargate';
import { StargateSigningClient } from 'interchainjs/stargate';
import { SigningClient } from 'interchainjs/signing-client';
import { RpcQuery } from 'interchainjs/query/rpc';
import { useEffect, useState } from "react";
import { useWalletManager } from './useWalletManager';
import { Chain } from '@chain-registry/v2-types';
import { useAccount } from './useAccount';

export const useInterchainClient = (chainName: string, walletName: string) => {
  const [rpcEndpoint, setRpcEndpoint] = useState<string | HttpEndpoint | undefined>()
  const [signingClient, setSigningClient] = useState<SigningClient | null>(null)
  const [queryClient, setQueryClient] = useState<RpcQuery | null>(null)
  const [signingStargateClient, setSigningStargateClient] = useState<StargateSigningClient | null>(null)
  const [signingCosmWasmClient, setSigningCosmWasmClient] = useState<CosmWasmSigningClient | null>(null)
  const [error, setError] = useState<string | unknown | null>(null);
  const [isLoading, setIsLoading] = useState(false)
  const walletManager = useWalletManager()
  const account = useAccount(chainName, walletName)
  const wallet = walletManager.wallets.find((w) => w.option.name === walletName)
  const chainToShow = walletManager.chains.find((c: Chain) => c.chainName === chainName)

  const initialize = async () => {
    if (wallet && chainToShow) {
      try {
        setIsLoading(true)

        const rpcEndpoint = await walletManager.getRpcEndpoint(wallet, chainName)
        setRpcEndpoint(rpcEndpoint)

        const clientFactory = await walletManager.createClientFactory(wallet, chainName)

        const queryClient = await clientFactory.getClient()
        setQueryClient(queryClient)

        const signingClient = await clientFactory.getSigningClient()
        setSigningClient(signingClient)

        const signingStargateClient = await clientFactory.getSigningStargateClient(chainToShow.bech32Prefix)
        setSigningStargateClient(signingStargateClient)

        const signingCosmwasmClient = await clientFactory.getSigningCosmwasmClient()
        setSigningCosmWasmClient(signingCosmwasmClient)

      } catch (error) {
        setError(error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    initialize()
  }, [chainName, walletName, account])

  return {
    rpcEndpoint,
    signingClient,
    queryClient,
    signingStargateClient,
    signingCosmWasmClient,
    error,
    isLoading
  }


}