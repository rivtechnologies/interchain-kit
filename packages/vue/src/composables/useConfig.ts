import { AssetList, Chain } from '@chain-registry/v2-types';
import { EndpointOptions, SignerOptions } from '@interchain-kit/core';

import { useWalletManager } from './useWalletManager';
export const useConfig = () => {
  const walletManager = useWalletManager();

  return {
    updateChains: (chains: Chain[]) => walletManager.chains = chains,
    updateAssetLists: (assetLists: AssetList[]) => walletManager.assetLists = assetLists,
    updateSignerOptions: (signerOptions: SignerOptions) => walletManager.signerOptions = signerOptions,
    updateEndpoints: (endpointOptions: EndpointOptions) => walletManager.endpointOptions = endpointOptions,
  };
};