import { Wallet } from "@interchain-kit/core";
import { ICON } from "./constant";


export const exodusExtensionInfo: Wallet = {
    windowKey: 'exodus',
    walletIdentifyKey: 'exodus.ethereum.isExodus',
    ethereumKey: 'exodus.ethereum',
    name: 'exodus-extension',
    prettyName: 'Exodus',
    logo: ICON,
    mode: 'extension',
    downloads: [
        {
            device: 'desktop',
            browser: 'chrome',
            link:
                'https://chrome.google.com/webstore/detail/exodus-web3-wallet/aholpfdialjgjfhomihkjbmgjidlcdno',
        },
        {
            device: 'desktop',
            browser: 'firefox',
            link: 'https://www.exodus.com/download',
        },
    ],
};
