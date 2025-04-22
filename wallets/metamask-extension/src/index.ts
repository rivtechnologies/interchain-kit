
import { EthereumWallet, ExtensionWallet } from "@interchain-kit/core";
import { MetaMaskExtensionInfo } from "./registry";

export * from './constant'
export * from './registry'


const metaMaskWallet = new ExtensionWallet(MetaMaskExtensionInfo)

metaMaskWallet.setNetworkWallet('eip155', new EthereumWallet(MetaMaskExtensionInfo))

export { metaMaskWallet }