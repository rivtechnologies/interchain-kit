import { OkxwalletExtensionInfo } from "./registry"
import { CosmosWallet, EthereumWallet, ExtensionWallet, PlatformWallet, WCMobileWebWallet } from '@interchain-kit/core';

const web = new ExtensionWallet(OkxwalletExtensionInfo)

web.setNetworkWallet('cosmos', new CosmosWallet(OkxwalletExtensionInfo))
web.setNetworkWallet('eip155', new EthereumWallet(OkxwalletExtensionInfo))


const okxWallet = new PlatformWallet(OkxwalletExtensionInfo)
okxWallet.setPlatformWallet('web', web)
okxWallet.setPlatformWallet('mobile-web', new WCMobileWebWallet(OkxwalletExtensionInfo))

export { okxWallet }