
import { Wallet } from '@interchain-kit/core';

import { ICON } from './contant';


export const phantomExtensionInfo: Wallet = {
  windowKey: 'phantom',
  ethereumKey: 'phantom.ethereum',
  solanaKey: 'phantom.solana',
  walletIdentifyKey: 'phantom.ethereum.isPhantom',
  name: 'phantom-extension',
  prettyName: 'Phantom',
  mode: 'extension',
  logo: ICON,
  keystoreChange: 'accountChanged',
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link: 'https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa',
    },
    {
      device: 'desktop',
      browser: 'firefox',
      link: 'https://addons.mozilla.org/en-US/firefox/addon/phantom-app/',
    },
    {
      link: 'https://phantom.app/download',
    },
  ],
  walletconnect: {
    name: 'Phantom',
    projectId: '6adb6082c909901b9e7189af3a4a0223102cd6f8d5c39e39f3d49acb92b578bb'
  },
  walletConnectLink: {
    android: `intent://wcV2?{wc-uri}#Intent;package=com.phantom.wallet;scheme=phantomwallet;end;`,
    // android: `phantomwallet://wcV2?{wc-uri}`,
    ios: `phantomwallet://wcV2?{wc-uri}`
  }
};
