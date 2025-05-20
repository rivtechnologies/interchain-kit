import { Wallet } from "@interchain-kit/core";
import { ICON } from "./constant";

export const frontierExtensionInfo: Wallet = {
  windowKey: 'frontier',
  name: 'frontier-extension',
  prettyName: 'Frontier',
  logo: ICON,
  mode: 'extension',
  keystoreChange: 'frontier_keystorechange',
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link:
        'https://chrome.google.com/webstore/detail/frontier-wallet/kppfdiipphfccemcignhifpjkapfbihd',
    },
    {
      link:
        'https://chrome.google.com/webstore/detail/frontier-wallet/kppfdiipphfccemcignhifpjkapfbihd',
    },
  ],
};
