import { HttpEndpoint } from '@interchainjs/types';
import { useWalletManager } from "./useWalletManager"
import { useEffect, useState } from 'react';
export const useRpcEndpoint = (chainName: string, walletName: string): {
  rpcEndpoint: string | HttpEndpoint | unknown;
  isLoading: boolean;
  error: Error | null;
} => {
  const { getRpcEndpoint } = useWalletManager()

  const [rpcEndpoint, setRpcEndpoint] = useState<string | HttpEndpoint | unknown>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    getRpcEndpoint(walletName, chainName)
      .then((endpoint) => {
        setRpcEndpoint(endpoint)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err)
        setIsLoading(false)
      })
  }, [chainName, walletName])

  return { rpcEndpoint, isLoading, error }
}
