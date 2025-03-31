import { CosmosWallet, EthereumWallet, ExtensionWallet } from "@interchain-kit/core";
import { keplrExtensionInfo } from "./registry";

export * from './registry'

const keplrWallet = new ExtensionWallet(keplrExtensionInfo)


keplrWallet.setNetworkWallet('cosmos', new CosmosWallet(keplrExtensionInfo))
keplrWallet.setNetworkWallet('eip155', new EthereumWallet(keplrExtensionInfo))

export { keplrWallet }