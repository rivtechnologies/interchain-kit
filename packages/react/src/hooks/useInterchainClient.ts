import { CosmWasmSigningClient } from 'interchainjs/cosmwasm-stargate';
import { StargateSigningClient } from 'interchainjs/stargate';
import { StargateClient, HttpEndpoint } from '@cosmjs/stargate';
import { SigningClient } from 'interchainjs/signing-client';
import { RpcQuery } from 'interchainjs/query/rpc';
import { useEffect, useState } from "react";
import { useWalletManager } from './useWalletManager';
import { Chain } from '@chain-registry/v2-types';
import { useAccount } from './useAccount';

export const useInterchainClient = (chainName: string, walletName: string) => {
  const [rpcEndpoint, setRpcEndpoint] = useState<string | HttpEndpoint | undefined>()
  const [signingClient, setSigningClient] = useState<SigningClient | null>(null)
  const [client, setClient] = useState<RpcQuery | null>(null)
  const [stargateSigningClient, setStargateSigningClient] = useState<StargateSigningClient | null>(null)
  const [stargateClient, setStargateClient] = useState<StargateClient | undefined>()
  const [cosmWasmSigningClient, setCosmWasmSigningClient] = useState<CosmWasmSigningClient | null>(null)
  const [error, setError] = useState<string | unknown | null>(null);
  const [isLoading, setIsLoading] = useState(false)
  const walletManager = useWalletManager()
  const account = useAccount(chainName, walletName)

  const initialize = async () => {
    const wallet = walletManager.wallets.find((w) => w.option.name === walletName)
    const chainToShow = walletManager.chains.find((c: Chain) => c.chainName === chainName)
    if (!wallet) {
      throw new Error('Wallet not found')
    }
    if (!chainToShow) {
      throw new Error('Chain not found')
    }
    try {
      setIsLoading(true)

      const rpcEndpoint = await walletManager.getRpcEndpoint(wallet, chainName)
      setRpcEndpoint(rpcEndpoint)

      const clientFactory = await walletManager.createClientFactory(wallet, chainName)

      const client = await clientFactory.getClient()
      setClient(client)

      const signingClient = await clientFactory.getSigningClient()
      setSigningClient(signingClient)

      const stargateClient = await clientFactory.getStargateClient()
      setStargateClient(stargateClient)

      const signingStargateClient = await clientFactory.getSigningStargateClient(chainToShow.bech32Prefix)
      setStargateSigningClient(signingStargateClient)

      const signingCosmwasmClient = await clientFactory.getSigningCosmwasmClient()
      setCosmWasmSigningClient(signingCosmwasmClient)

    } catch (error) {
      setError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    initialize()
  }, [chainName, walletName, account?.address])

  return {
    rpcEndpoint,
    signingClient,
    client,
    stargateSigningClient,
    stargateClient,
    cosmWasmSigningClient,
    error,
    isLoading
  }


}