import { HttpEndpoint } from '@interchainjs/types';
import { CosmWasmSigningClient } from 'interchainjs/cosmwasm';
import { SigningClient } from 'interchainjs/signing-client';
import { RpcQuery } from 'interchainjs/query/rpc';
import { CosmosSigningClient } from 'interchainjs/cosmos';
import { Chain, AssetList } from '@chain-registry/v2-types';
import { BaseWallet, WalletState } from '@interchain-kit/core';

export type CosmosKitUseChainReturnType = {
  connect: () => void
  disconnect: () => void
  openView: () => void
  closeView: () => void
  getRpcEndpoint: () => Promise<string | HttpEndpoint>
  status: WalletState
  username: string
  message: string
  getSigningCosmWasmClient: () => Promise<CosmWasmSigningClient>
  getSigningCosmosClient: () => Promise<CosmosSigningClient>
}

export type UseChainReturnType = {
  logoUrl: string | undefined,
  chain: Chain,
  assetList: AssetList,
  address: string,
  wallet: BaseWallet
  rpcEndpoint: string | HttpEndpoint
  queryClient: RpcQuery
  signingClient: SigningClient
  signingCosmosClient: CosmosSigningClient
  signingCosmWasmClient: CosmWasmSigningClient
  isLoading: boolean
  error: unknown
}

