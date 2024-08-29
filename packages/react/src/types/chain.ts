import { HttpEndpoint } from '@cosmjs/stargate';
import { Chain, AssetList } from '@chain-registry/v2-types';
import { BaseWallet, InterchainJsSigner } from '@interChain-kit/core';

export type UseChainReturnType = {
  chain: Chain,
  assetList: AssetList,
  address: string,
  wallet: BaseWallet
  getRpcEndpoint: () => Promise<string | HttpEndpoint>,
} & Omit<InterchainJsSigner, 'rpcEndpoint' | 'offlineSigner' | 'signerOptions'>