import { CosmosWallet, MultiChainWallet } from '@interchain-kit/core';

import { compassExtensionInfo } from './registry';

export * from './registry';


const compassWallet = new MultiChainWallet(compassExtensionInfo);

compassWallet.setNetworkWallet('cosmos', new CosmosWallet(compassExtensionInfo));

export { compassWallet };