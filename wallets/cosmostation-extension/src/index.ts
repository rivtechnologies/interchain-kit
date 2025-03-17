import { CosmosWallet, EthereumWallet, MultiChainWallet } from '@interchain-kit/core';
import { CosmostationExtension } from './extension';
import { cosmostationExtensionInfo } from "./registry";

export * from './extension'
export * from './registry'

// const cosmostationWallet = new CosmostationExtension(cosmostationExtensionInfo);

const cosmostationWallet = new MultiChainWallet(cosmostationExtensionInfo);

cosmostationWallet.setNetworkWallet('cosmos', new CosmosWallet(cosmostationExtensionInfo));
cosmostationWallet.setNetworkWallet('eip155', new EthereumWallet(cosmostationExtensionInfo));


export { cosmostationWallet }