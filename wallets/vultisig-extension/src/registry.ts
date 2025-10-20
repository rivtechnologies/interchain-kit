import { Wallet } from '@interchain-kit/core';

import { ICON } from './constant';

export const vultisigExtensionInfo: Wallet = {
  name: 'vultisig-extension',
  prettyName: 'Vultisig',
  windowKey: 'vultisig',
  solanaKey: 'vultisig.solana',
  cosmosKey: 'vultisig.keplr',
  walletIdentifyKey: 'vultisig.keplr.isVultisig',
  ethereumKey: 'vultisig.ethereum',
  logo: ICON,
  mode: 'extension',
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link: 'https://chromewebstore.google.com/detail/vultisig-extension/ggafhcdaplkhmmnlbfjpnnkepdfjaelb',
    },
    {
      link: 'https://chromewebstore.google.com/detail/vultisig-extension/ggafhcdaplkhmmnlbfjpnnkepdfjaelb',
    },
  ],
};
