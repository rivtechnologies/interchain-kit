import { Chain } from '@chain-registry/types';
export const createMockChain = (
  { chainName, chainId, rpcEndpoint, bech32Prefix, chainType }: { chainName: string; chainId?: string; rpcEndpoint: { address: string }[]; bech32Prefix?: string; chainType: Chain['chainType'] } = {
    chainName: 'chain-1',
    chainId: '1',
    rpcEndpoint: [{ address: 'http://localhost:26657' }],
    bech32Prefix: 'cosmos',
    chainType: 'cosmos',
  }
): Chain => {
  const mockChain: Chain = {
    chainName,
    chainId,
    apis: { rpc: rpcEndpoint },
    bech32Prefix,
    chainType,
  };
  return mockChain;
};



