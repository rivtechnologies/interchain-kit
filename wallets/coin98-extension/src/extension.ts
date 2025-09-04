import { CosmosWallet, EthereumWallet, MultiChainWallet } from '@interchain-kit/core';

import { coin98ExtensionInfo } from './registry';

export * from './registry';

const coin98Wallet = new MultiChainWallet(coin98ExtensionInfo);

coin98Wallet.setNetworkWallet('eip155', new EthereumWallet(coin98ExtensionInfo));
coin98Wallet.setNetworkWallet('cosmos', new CosmosWallet(coin98ExtensionInfo));

export {
  coin98Wallet
};