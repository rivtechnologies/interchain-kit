import { ExtensionWallet, SolanaWallet } from '@interchain-kit/core';

import { solflareExtensionInfo } from './registry';

export * from './constant';
export * from './registry';


const solflareWallet = new ExtensionWallet(solflareExtensionInfo);

solflareWallet.setNetworkWallet('solana', new SolanaWallet(solflareExtensionInfo));

export {
  solflareWallet
};