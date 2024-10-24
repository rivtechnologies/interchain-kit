import { AssetList,Chain } from '@chain-registry/v2-types';
import { BaseWallet, WalletState } from '@interchain-kit/core';
import { InjSigningClient } from '@interchainjs/injective/signing-client';
import { HttpEndpoint } from '@interchainjs/types';
import { CosmosSigningClient } from 'interchainjs/cosmos';
import { CosmWasmSigningClient } from 'interchainjs/cosmwasm';
import { RpcQuery } from 'interchainjs/query/rpc';
import { SigningClient } from 'interchainjs/signing-client';
import { ComputedRef, Ref } from 'vue';

export type CosmosKitUseChainReturnType = {
  connect: () => void
  disconnect: () => void
  openView: () => void
  closeView: () => void
  getRpcEndpoint: Ref<() => Promise<string | HttpEndpoint>>
  status: ComputedRef<WalletState>
  username: ComputedRef<string>
  message: ComputedRef<string>
  getSigningCosmWasmClient: Ref<() => Promise<CosmWasmSigningClient>>
  getSigningCosmosClient: Ref<() => Promise<CosmosSigningClient>>
}

export type UseChainReturnType = {
  logoUrl: Ref<string | undefined>
  chain: Ref<Chain>
  assetList: Ref<AssetList>
  address: ComputedRef<string>
  wallet: Ref<BaseWallet>
  rpcEndpoint: Ref<string | HttpEndpoint>
  queryClient: Ref<RpcQuery>
  signingClient: Ref<SigningClient | InjSigningClient | null>
  signingCosmosClient: Ref<CosmosSigningClient | null>
  signingCosmWasmClient: Ref<CosmWasmSigningClient>
  signingInjectiveClient: Ref<InjSigningClient>
  isLoading: Ref<boolean>
  error: Ref<unknown>
}

