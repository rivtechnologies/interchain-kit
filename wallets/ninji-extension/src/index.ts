import { CosmosWallet, ExtensionWallet } from '@interchain-kit/core';

import { ninjiExtensionInfo } from './registry';

export * from './registry';

const ninjiWallet = new ExtensionWallet(ninjiExtensionInfo);

ninjiWallet.setNetworkWallet('cosmos', new CosmosWallet(ninjiExtensionInfo));


export { ninjiWallet };