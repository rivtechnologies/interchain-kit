import { HttpEndpoint } from '@interchainjs/types';
import { CosmWasmSigningClient } from 'interchainjs/cosmwasm-stargate';
import { SigningClient } from 'interchainjs/signing-client';
import { RpcQuery } from 'interchainjs/query/rpc';
import { StargateSigningClient } from 'interchainjs/stargate';
import { Chain, AssetList } from '@chain-registry/v2-types';
import { BaseWallet, WalletState } from '@interchain-kit/core';

export type CosmosKitUseChainReturnType = {
  connect: () => void
  openView: () => void
  closeView: () => void
  getRpcEndpoint: () => Promise<string | HttpEndpoint>
  status: WalletState
  username: string
  message: string
  getSigningCosmWasmClient: () => Promise<CosmWasmSigningClient>
  getSigningStargateClient: () => Promise<StargateSigningClient>
}

export type UseChainReturnType = {
  chain: Chain,
  assetList: AssetList,
  address: string,
  wallet: BaseWallet
  rpcEndpoint: string | HttpEndpoint
  queryClient: RpcQuery
  signingClient: SigningClient
  signingStargateClient: StargateSigningClient
  signingCosmWasmClient: CosmWasmSigningClient
  isLoading: boolean
  error: unknown
}

