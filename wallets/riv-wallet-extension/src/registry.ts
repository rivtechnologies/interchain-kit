import { Wallet } from '@interchain-kit/core';
import { ICON } from './constant';

export const rivWalletExtensionInfo: Wallet = {
  windowKey: 'rivWallet',
  // ethereumKey: 'rivWallet',
  // walletIdentifyKey: 'myNewWallet.ethereum.isMyNewWallet',
  name: 'riv-wallet-extension',
  prettyName: 'RIV Wallet',
  mode: 'extension',
  logo: ICON,
  keystoreChange: 'rivWallet_keystorechange',
  downloads: [
    {
      device: 'mobile',
      os: 'android',
      link:
        'https://play.google.com/store/apps/details?id=com.riv_wallet',
    },
    {
      device: 'mobile',
      os: 'ios',
      link: 'https://apps.apple.com/us/app/riv-wallet/id6502936179',
    },
  ],
  // For WalletConnect support (if applicable)
  walletconnect: {
    name: 'RIV Wallet',
    projectId: '31393502b32bbb007fcb74367656a389'
  },
  walletConnectLink: {
    android: `rivwallet://wcV2?{wc-uri}`,
    ios: `rivwallet://wcV2?{wc-uri}`
  }
};