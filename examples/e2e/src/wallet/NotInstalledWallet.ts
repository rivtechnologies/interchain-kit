import { clientNotExistError, CosmosWallet, ExtensionWallet, Wallet } from '@interchain-kit/core';

const notInstalledWalletInfo: Wallet = {
  name: 'notInstalledWallet',
  mode: 'extension',
  prettyName: 'Not Installed Wallet',
  windowKey: 'notInstalledWallet',
  cosmosKey: 'notInstalledWallet',
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link: 'http://show-not-installed-wallet.link',
    },
  ]
};



export const notInstalledWallet = new ExtensionWallet(notInstalledWalletInfo);

notInstalledWallet.setNetworkWallet('cosmos', new CosmosWallet(notInstalledWalletInfo));

notInstalledWallet.init = () => {
  throw clientNotExistError;
};