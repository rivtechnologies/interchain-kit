
import { EthereumWallet, MultiChainWallet } from "@interchain-kit/core";
import { MetaMaskExtensionInfo } from "./registry";

export * from './constant'
export * from './registry'


const metaMaskExtension = new MultiChainWallet(MetaMaskExtensionInfo)

metaMaskExtension.setNetworkWallet('eip155', new EthereumWallet(MetaMaskExtensionInfo))

export { metaMaskExtension }