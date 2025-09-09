import { Wallet } from '@interchain-kit/core';

import { ICON } from './constant';

export const ninjiExtensionInfo: Wallet = {
  name: 'ninji-extension',
  prettyName: 'Ninji',
  windowKey: 'ninji',
  cosmosKey: 'ninji',
  walletIdentifyKey: 'ninji',
  logo: ICON,
  mode: 'extension',
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link: 'https://chromewebstore.google.com/detail/ninji-wallet/kkpllbgjhchghjapjbinnoddmciocphm',
    },
    {
      link: 'https://ninji.xyz/#download',
    },
  ],
};
