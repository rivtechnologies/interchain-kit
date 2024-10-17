import { HttpEndpoint } from '@interchainjs/types';
import { CosmWasmSigningClient } from 'interchainjs/cosmwasm';
import { InjSigningClient } from '@interchainjs/injective/signing-client';
import { SigningClient } from 'interchainjs/signing-client';
import { RpcQuery } from 'interchainjs/query/rpc';
import { CosmosSigningClient } from 'interchainjs/cosmos';
import { Chain, AssetList } from '@chain-registry/v2-types';
import { BaseWallet, WalletState } from '@interchain-kit/core';
import { ComputedRef, Ref } from 'vue';

export type CosmosKitUseChainReturnType = {
  connect: () => void
  disconnect: () => void
  openView: () => void
  closeView: () => void
  getRpcEndpoint: () => Promise<string | HttpEndpoint>
  status: WalletState
  username: ComputedRef<string>
  message: string
  getSigningCosmWasmClient: () => Promise<CosmWasmSigningClient>
  getSigningCosmosClient: () => Promise<CosmosSigningClient>
}

export type UseChainReturnType = {
  logoUrl: string | undefined
  chain: Chain
  assetList: AssetList
  address: ComputedRef<string>
  wallet: BaseWallet
  rpcEndpoint: Ref<string | HttpEndpoint>
  queryClient: Ref<RpcQuery>
  signingClient: Ref<SigningClient | InjSigningClient | null>
  signingCosmosClient: Ref<CosmosSigningClient | null>
  signingCosmWasmClient: Ref<CosmWasmSigningClient>
  signingInjectiveClient: Ref<InjSigningClient>
  isLoading: Ref<boolean>
  error: Ref<unknown>
}

