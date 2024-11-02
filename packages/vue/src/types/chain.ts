import { AssetList, Chain } from '@chain-registry/v2-types';
import { BaseWallet, WalletState } from '@interchain-kit/core';
import { HttpEndpoint } from '@interchainjs/types';
import { SigningClient } from '@interchainjs/cosmos/signing-client';
import { ComputedRef, Ref } from 'vue';

export type CosmosKitUseChainReturnType = {
  connect: ComputedRef<() => void>
  disconnect: ComputedRef<() => void>
  openView: () => void
  closeView: () => void
  getRpcEndpoint: Ref<() => Promise<string | HttpEndpoint>>
  status: ComputedRef<WalletState>
  username: ComputedRef<string>
  message: ComputedRef<string>
}

export type UseChainReturnType = {
  logoUrl: Ref<string | undefined>
  chain: Ref<Chain>
  assetList: Ref<AssetList>
  address: ComputedRef<string>
  wallet: Ref<BaseWallet>
  rpcEndpoint: Ref<string | HttpEndpoint>
  signingClient: Ref<SigningClient>
  isLoading: Ref<boolean>
  error: Ref<unknown>
} & CosmosKitUseChainReturnType

export type UseChainWalletReturnType = Omit<UseChainReturnType, 'openView' | 'closeView'>


