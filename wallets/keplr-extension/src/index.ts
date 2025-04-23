import { CosmosWallet, EthereumWallet, ExtensionWallet, PlatformWallet, SignOptions, WCMobileWebWallet } from "@interchain-kit/core";
import { keplrExtensionInfo } from "./registry";

export * from './registry'

const web = new ExtensionWallet(keplrExtensionInfo)
web.setNetworkWallet('cosmos', new CosmosWallet(keplrExtensionInfo))
web.setNetworkWallet('eip155', new EthereumWallet(keplrExtensionInfo))

class KeplrPlatformWallet extends PlatformWallet {
  setSignOptions(options: SignOptions) {
    const keplrWalletInWeb = keplrWallet.platformWalletMap.get("web") as ExtensionWallet;

    const keplrCosmosWalletInWeb = keplrWalletInWeb.getWalletByChainType("cosmos") as CosmosWallet;

    keplrCosmosWalletInWeb.setSignOptions(options);
  }
}

const keplrWallet = new KeplrPlatformWallet(keplrExtensionInfo)

keplrWallet.setPlatformWallet('web', web)
keplrWallet.setPlatformWallet('mobile-web', new WCMobileWebWallet(keplrExtensionInfo))

export { keplrWallet }