import { ExtensionWallet } from '@interchain-kit/core';
import { Coin98ExtensionInfo } from './registry';
export class Coin98Extension extends ExtensionWallet {
}

const coin98Wallet = new Coin98Extension(Coin98ExtensionInfo);

export {
    coin98Wallet
}