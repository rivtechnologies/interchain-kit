import { EthereumWallet, ExtensionWallet, SolanaWallet } from '@interchain-kit/core';

import { phantomExtensionInfo } from './registry';

export * from './registry';

const phantomWallet = new ExtensionWallet(phantomExtensionInfo);

phantomWallet.setNetworkWallet('solana', new SolanaWallet(phantomExtensionInfo));
phantomWallet.setNetworkWallet('eip155', new EthereumWallet(phantomExtensionInfo));

export { phantomWallet };