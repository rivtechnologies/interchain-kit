import { Keplr } from '@keplr-wallet/provider-extension';
import { BaseWallet } from '@interchain-kit/core'

export class KeplrWallet extends BaseWallet {
    async init() {
        this.client = await Keplr.getKeplr()
        return this.client
    }
}