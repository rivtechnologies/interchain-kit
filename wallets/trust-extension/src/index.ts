import { CosmosWallet, EthereumWallet, ExtensionWallet, selectWalletByPlatform, WCMobileWebWallet } from '@interchain-kit/core';

import { trustExtensionInfo } from './registry';

export * from './registry';

const web = new ExtensionWallet(trustExtensionInfo);
web.setNetworkWallet('cosmos', new CosmosWallet(trustExtensionInfo));
web.setNetworkWallet('eip155', new EthereumWallet(trustExtensionInfo));

const trustWallet = selectWalletByPlatform({
  mobileBrowser: new WCMobileWebWallet(trustExtensionInfo),
  inAppBrowser: web,
  desktopBrowser: web,
}, trustExtensionInfo);


export { trustWallet };