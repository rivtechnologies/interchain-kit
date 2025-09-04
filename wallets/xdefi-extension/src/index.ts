import { CosmosWallet, EthereumWallet, ExtensionWallet } from '@interchain-kit/core';

import { xdefiExtensionInfo } from './registry';



export * from './constant';
export * from './registry';

const xdefiWallet = new ExtensionWallet(xdefiExtensionInfo);

xdefiWallet.setNetworkWallet('cosmos', new CosmosWallet(xdefiExtensionInfo));
xdefiWallet.setNetworkWallet('eip155', new EthereumWallet(xdefiExtensionInfo));

export { xdefiWallet };
