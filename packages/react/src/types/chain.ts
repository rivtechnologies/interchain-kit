import { CosmWasmSigningClient } from 'interchainjs/cosmwasm-stargate';
import { StargateClient } from '@cosmjs/stargate';
import { SigningClient } from 'interchainjs/signing-client';
import { RpcQuery } from 'interchainjs/query/rpc';
import { StargateSigningClient } from 'interchainjs/stargate';
import { HttpEndpoint } from '@cosmjs/stargate';
import { Chain, AssetList } from '@chain-registry/v2-types';
import { BaseWallet } from '@interChain-kit/core';

export type UseChainReturnType = {
  chain: Chain,
  assetList: AssetList,
  address: string,
  wallet: BaseWallet
  rpcEndpoint: string | HttpEndpoint
  client: RpcQuery
  signingClient: SigningClient
  stargateClient: StargateClient
  stargateSigningClient: StargateSigningClient
  cosmWasmSigningClient: CosmWasmSigningClient
  isLoading: boolean
  error: unknown
}

