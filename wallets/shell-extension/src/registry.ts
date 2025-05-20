import { Wallet } from "@interchain-kit/core";
import { ICON } from "./constant";


export const shellExtensionInfo: Wallet = {
    name: 'shell-extension',
    prettyName: 'Shell',
    windowKey: 'shellwallet',
    cosmosKey: 'shellwallet',
    walletIdentifyKey: 'shellwallet',
    logo: ICON,
    mode: 'extension',
    downloads: [
        {
            device: 'desktop',
            browser: 'chrome',
            link:
                'https://chrome.google.com/webstore/detail/shell-wallet/kbdcddcmgoplfockflacnnefaehaiocb',
        },
    ],
};
