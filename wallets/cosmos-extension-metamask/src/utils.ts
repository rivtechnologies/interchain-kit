
import { AssetList, Chain } from '@chain-registry/types';

import { Chain as MetaMaskCosmosChainInfo } from './types';

export const getMetaMaskCosmosChainInfo = (chain: Chain, assetList: AssetList): MetaMaskCosmosChainInfo => {
  return {
    chain_name: chain.chainName,
    chain_id: chain.chainId,
    pretty_name: chain.prettyName,
    slip44: chain.slip44,
    bech32_prefix: chain.bech32Prefix,
    fees: {
      fee_tokens: chain.fees.feeTokens.map(feeToken => ({
        ...feeToken,
        low_gas_price: feeToken.lowGasPrice || 0,
        average_gas_price: feeToken.averageGasPrice || 0,
        high_gas_price: feeToken.highGasPrice || 0
      }))
    },
    staking: {
      staking_tokens: chain.staking.stakingTokens
    },
    logo_URIs: {
      png: chain.logoURIs.png || '',
      svg: chain.logoURIs.svg || ''
    },
    apis: {
      rpc: chain.apis.rpc || [],
      rest: chain.apis.rest || [],
      grpc: chain.apis.grpc || []
    },
    explorers: chain.explorers.map(explorer => ({
      ...explorer,
      kind: explorer.kind || '',
      url: explorer.url || ''
    })),
    address: undefined
  };
};