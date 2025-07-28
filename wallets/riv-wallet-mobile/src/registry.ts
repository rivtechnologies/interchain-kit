import { ICON } from './constant';
import { Wallet } from '@interchain-kit/core';

export const rivWalletMobileInfo: Wallet = {
    name: 'riv-wallet-mobile',
    prettyName: 'RIV Wallet Mobile',
    mode: 'wallet-connect',
    logo: ICON,
    downloads: [
        {
            device: 'mobile',
            os: 'android',
            link: 'https://play.google.com/store/apps/details?id=com.riv_wallet',
        },
        {
            device: 'mobile',
            os: 'ios',
            link: 'https://apps.apple.com/us/app/riv-wallet/id6502936179',
        }
    ],
    walletconnect: {
        name: 'RIV Wallet',
        projectId: '3139502b32bbb007fcb74367656a389'
    },
    walletConnectLink: {
        android: `rivwallet://wcV2?{wc-uri}`,
        ios: `rivwallet://wcV2?{wc-uri}`
    }
};