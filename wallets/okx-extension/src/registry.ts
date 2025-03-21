import { Wallet } from "@interchain-kit/core";
import { ICON } from "./constant";


export const OkxwalletExtensionInfo: Wallet = {
  windowKey: 'okxwallet.keplr',
  ethereumKey: 'okxwallet',
  walletIdentifyKey: 'okxwallet.isOkxWallet',
  name: 'okxwallet-extension',
  prettyName: 'OKX Wallet',
  logo: ICON,
  mode: 'extension',
  keystoreChange: 'okxwallet_keystorechange',
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link: 'https://chrome.google.com/webstore/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge',
    },
    {
      device: 'desktop',
      browser: 'firefox',
      link: 'https://addons.mozilla.org/zh-CN/firefox/addon/okexwallet/',
    },
    {
      link: 'https://www.okx.com/download',
    },
  ],
};
