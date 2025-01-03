import { HttpEndpoint } from '@interchainjs/types';
import { Chain, AssetList } from '@chain-registry/v2-types';
import { BaseWallet, WalletState } from '@interchain-kit/core';
import { SigningClient } from './sign-client';

export type CosmosKitUseChainReturnType = {
  connect: () => void
  disconnect: () => void
  openView: () => void
  closeView: () => void
  getRpcEndpoint: () => Promise<string | HttpEndpoint>
  status: WalletState
  username: string
  message: string
}

export type UseChainReturnType = {
  logoUrl: string | undefined,
  chain: Chain,
  assetList: AssetList,
  address: string,
  wallet: BaseWallet
  rpcEndpoint: string | HttpEndpoint
  signingClient: SigningClient
  getSigningClient: () => Promise<SigningClient>
  isRpcEndpointLoading: boolean
  isAccountLoading: boolean
  isSigningClientLoading: boolean
  isLoading: boolean
  getRpcEndpointError: Error | null,
  getSigningClientError: Error | null,
  getAccountError: Error | null,
} & CosmosKitUseChainReturnType

export type UseChainWalletReturnType = Omit<UseChainReturnType, 'openView' | 'closeView'>

export type UseInterchainClientReturnType = {
  signingClient: SigningClient | null,
  error: string | unknown | null,
  isLoading: boolean
}