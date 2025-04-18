import { CosmosWallet, EthereumWallet, ExtensionWallet, PlatformWallet, WCMobileWebWallet } from "@interchain-kit/core";
import { keplrExtensionInfo } from "./registry";

export * from './registry'

const web = new ExtensionWallet(keplrExtensionInfo)
web.setNetworkWallet('cosmos', new CosmosWallet(keplrExtensionInfo))
web.setNetworkWallet('eip155', new EthereumWallet(keplrExtensionInfo))

const keplrWallet = new PlatformWallet(keplrExtensionInfo)
keplrWallet.setPlatformWallet('web', web)
keplrWallet.setPlatformWallet('mobile-web', new WCMobileWebWallet(keplrExtensionInfo))

export { keplrWallet }