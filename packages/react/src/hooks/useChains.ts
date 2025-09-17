import { Chain } from '@chain-registry/types';

import { UseChainReturnType } from './../types/chain';
import { useChain } from './useChain';

export const useChains = (chainNames: Chain['chainName'][]) => {
  const results: Record<Chain['chainName'], UseChainReturnType> = {};

  chainNames.forEach(chainName => {
    results[chainName] = useChain(chainName);
  });

  return results;
};












