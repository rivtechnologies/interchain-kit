
import { Wallet } from '@interchain-kit/core';

import { ICON } from './constant';


export const solflareExtensionInfo: Wallet = {
  windowKey: 'solflare',
  solanaKey: 'solflare',
  walletIdentifyKey: 'solana.isBackpack',
  name: 'solflare-extension',
  prettyName: 'Solflare',
  mode: 'extension',
  logo: ICON,
  keystoreChange: 'accountChanged',
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link: 'https://chromewebstore.google.com/detail/solflare-wallet/bhhhlbepdkbapadjdnnojkbgioiodbic',
    },
    {
      device: 'desktop',
      browser: 'firefox',
      link: 'https://addons.mozilla.org/en-US/firefox/addon/solflare-wallet/',
    },
    {
      link: 'https://www.solflare.com/download/',
    },
  ],
  walletconnect: {
    name: 'Solflare',
    projectId: '1ca0bdd4747578705b1939af023d120677c64fe6ca76add81fda36e350605e79'
  },
};
