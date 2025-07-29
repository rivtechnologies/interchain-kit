import { ICON } from './constant';
import { OS, Wallet } from '@interchain-kit/core';

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
        projectId: '3139502b32bbb007fcb74367656a389',
        encoding: 'base64',
        mobile: {
            native: {
                ios: 'leapcosmos:',
                android: 'intent:',
            },
        },
        formatNativeUrl: (
            appUrl: string,
            wcUri: string,
            os: OS | undefined,
            _name: string
        ): string => {
            const plainAppUrl = appUrl.split(':')[0];
            const encodedWcUrl = encodeURIComponent(wcUri);
            switch (os) {
                case 'ios':
                    return `${plainAppUrl}://wcV2?${encodedWcUrl}`;
                case 'android':
                    return `${plainAppUrl}://wcV2?${encodedWcUrl}#Intent;package=com.riv_wallet;scheme=rivwallet;end;`;
                default:
                    return `${plainAppUrl}://wcV2?${encodedWcUrl}`;
            }
        },
    },
};