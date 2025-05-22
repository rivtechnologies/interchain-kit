import { Wallet } from "@interchain-kit/core";
import { ICON } from "./constant";

export const trustExtensionInfo: Wallet = {
  windowKey: 'trustWallet',
  cosmosKey: 'trustWallet.cosmos',
  ethereumKey: 'trustWallet',
  name: 'trust-extension',
  prettyName: 'Trust',
  logo: ICON,
  mode: 'extension',
  keystoreChange: 'trust_keystorechange',
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link:
        'https://chrome.google.com/webstore/detail/trust-wallet/egjidjbpglichdcondbcbdnbeeppgdph',
    },
    {
      device: 'desktop',
      browser: 'firefox',
      link:
        'https://addons.mozilla.org/en-US/firefox/addon/terra-trust-wallet/',
    },
    {
      device: 'desktop',
      browser: 'edge',
      link:
        'https://microsoftedge.microsoft.com/addons/detail/trust-wallet/ajkhoeiiokighlmdnlakpjfoobnjinie',
    },
  ],
  walletconnect: {
    name: 'Trust Wallet',
    projectId: '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'
  },
  walletConnectLink: {
    android: `https://link.trustwallet.com/wc?uri={wc-uri}`,
  }
};
