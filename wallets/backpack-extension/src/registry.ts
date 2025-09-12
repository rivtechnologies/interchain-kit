
import { Wallet } from '@interchain-kit/core';

import { ICON } from './constant';


export const backPackExtensionInfo: Wallet = {
  windowKey: 'backpack',
  ethereumKey: 'backpack.ethereum',
  solanaKey: 'backpack.solana',
  walletIdentifyKey: 'backpack.solana.isBackpack',
  name: 'backpack-extension',
  prettyName: 'Backpack',
  mode: 'extension',
  logo: ICON,
  keystoreChange: 'accountChanged',
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link: 'https://chromewebstore.google.com/detail/backpack/aflkmfhebedbjioipglgcbcmnbpgliof',
    },
    {
      device: 'desktop',
      browser: 'firefox',
      link: 'https://addons.mozilla.org/en-US/firefox/addon/phantom-app/',
    },
    {
      link: 'https://backpack.app/download',
    },
  ],
  walletconnect: {
    name: 'Backpack',
    projectId: '2bd8c14e035c2d48f184aaa168559e86b0e3433228d3c4075900a221785019b0'
  },
};
