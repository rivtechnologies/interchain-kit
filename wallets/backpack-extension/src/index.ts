import { EthereumWallet, ExtensionWallet, SolanaWallet } from '@interchain-kit/core';

import { backPackExtensionInfo } from './registry';

export * from './constant';
export * from './registry';

const backPackWallet = new ExtensionWallet(backPackExtensionInfo);

backPackWallet.setNetworkWallet('eip155', new EthereumWallet(backPackExtensionInfo));
backPackWallet.setNetworkWallet('solana', new SolanaWallet(backPackExtensionInfo));


export {
  backPackWallet
};