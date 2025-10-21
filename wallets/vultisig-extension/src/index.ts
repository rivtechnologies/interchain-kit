import {
  CosmosWallet,
  EthereumWallet,
  ExtensionWallet,
  SolanaWallet,
} from '@interchain-kit/core';

import { vultisigExtensionInfo } from './registry';

export * from './constant';
export * from './registry';

const vultisigWallet = new ExtensionWallet(vultisigExtensionInfo);

vultisigWallet.setNetworkWallet(
  'cosmos',
  new CosmosWallet(vultisigExtensionInfo)
);
vultisigWallet.setNetworkWallet(
  'eip155',
  new EthereumWallet(vultisigExtensionInfo)
);
vultisigWallet.setNetworkWallet(
  'solana',
  new SolanaWallet(vultisigExtensionInfo)
);

export { vultisigWallet };
