

import { Wallet } from '@interchain-kit/core';
import { LEAP_LOGO, METAMASK_LOGO } from './constant';

export const metamaskLeapCosmosSnapInfo: Wallet = {
  name: 'leap-metamask-cosmos-snap',
  description:
    'The Leap Cosmos MetaMask Snap allows signing of Cosmos transactions using MetaMask.',
  prettyName: 'Leap Cosmos MetaMask',
  logo: { major: METAMASK_LOGO, minor: LEAP_LOGO },
  mode: 'extension',
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link:
        'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn',
    },
    {
      link:
        'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn',
    },
  ],
};
