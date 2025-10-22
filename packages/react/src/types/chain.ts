import { AssetList,Chain } from '@chain-registry/types';
import { WalletState } from '@interchain-kit/core';
import { ChainWalletStore } from '@interchain-kit/store';
import { HttpEndpoint } from '@interchainjs/types';

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
  wallet: ChainWalletStore | undefined,
  rpcEndpoint: string | HttpEndpoint | unknown
  getSigningClient: () => Promise<SigningClient>

  signingClient: SigningClient | null
  isSigningClientLoading: boolean
  signingClientError: Error | unknown | null

} & CosmosKitUseChainReturnType

export type UseChainWalletReturnType = {
  logoUrl: string | undefined,
  chain: Chain,
  assetList: AssetList,
  address: string,
  wallet: ChainWalletStore,
  rpcEndpoint: string | HttpEndpoint | unknown
  getSigningClient: () => Promise<SigningClient>

  signingClient: SigningClient | null
  isSigningClientLoading: boolean
  signingClientError: Error | unknown | null

  //for migration cosmos kit
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  getRpcEndpoint: () => Promise<string | HttpEndpoint>
  status: WalletState
  username: string
  message: string
}

export type UseInterchainClientReturnType = {
  signingClient: SigningClient | null,
  error: string | unknown | null,
  isLoading: boolean
}