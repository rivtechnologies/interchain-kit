import { CosmosWallet, EthereumWallet, MultiChainWallet } from '@interchain-kit/core';
import { trustExtensionInfo } from "./registry";


export * from './registry'

const trustExtension = new MultiChainWallet(trustExtensionInfo);

trustExtension.setNetworkWallet('cosmos', new CosmosWallet(trustExtensionInfo));
trustExtension.setNetworkWallet('eip155', new EthereumWallet(trustExtensionInfo));

export { trustExtension }