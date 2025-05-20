import { Wallet } from "@interchain-kit/core";
import { ICON } from "./constant";


export const leapExtensionInfo: Wallet = {
  windowKey: 'leap',
  cosmosKey: 'leap',
  ethereumKey: 'leap.ethereum',
  name: 'leap-extension',
  prettyName: 'Leap',
  logo: ICON,
  mode: 'extension',
  keystoreChange: 'leap_keystorechange',
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link: 'https://chrome.google.com/webstore/detail/leap-cosmos-wallet/fcfcfllfndlomdhbehjjcoimbgofdncg',
    },
    {
      link: 'https://chrome.google.com/webstore/detail/leap-cosmos-wallet/fcfcfllfndlomdhbehjjcoimbgofdncg',
    },
  ],
  walletconnect: {
    name: 'Leap Wallet',
    projectId: '3ed8cc046c6211a798dc5ec70f1302b43e07db9639fd287de44a9aa115a21ed6'
  },
  walletConnectLink: {
    android: `leapcosmos://wcV2?{wc-uri}`,
    ios: `leapcosmos://wcV2?{wc-uri}`,
  }
};
