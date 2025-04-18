import { CosmosWallet, EthereumWallet, ExtensionWallet, PlatformWallet, WCMobileWebWallet } from '@interchain-kit/core';
import { trustExtensionInfo } from "./registry";


export * from './registry'

const web = new ExtensionWallet(trustExtensionInfo);

web.setNetworkWallet('cosmos', new CosmosWallet(trustExtensionInfo));
web.setNetworkWallet('eip155', new EthereumWallet(trustExtensionInfo));


const trustWallet = new PlatformWallet(trustExtensionInfo)
trustWallet.setPlatformWallet('web', web);
trustWallet.setPlatformWallet('mobile-web', new WCMobileWebWallet(trustExtensionInfo));


export { trustWallet }