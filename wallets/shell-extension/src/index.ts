import { CosmosWallet, ExtensionWallet } from '@interchain-kit/core';

import { shellExtensionInfo } from './registry';

export * from './registry';

const shellWallet = new ExtensionWallet(shellExtensionInfo);

shellWallet.setNetworkWallet('cosmos', new CosmosWallet(shellExtensionInfo));

export {
  shellWallet
};