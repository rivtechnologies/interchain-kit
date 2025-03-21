import { Wallet } from "@interchain-kit/core";
import { ICON } from "./constant";


export const leapExtensionInfo: Wallet = {
  windowKey: 'leap',
  walletIdentifyKey: 'leap.ethereum.isLeap',
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
};
