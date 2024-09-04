import { LedgerWallet } from '@interchain-kit/core';
import { LedgerInfo } from './registry';

export * from './registry'
export * from './constant'



export class Ledger extends LedgerWallet {
    // ...
}

const ledgerWallet = new Ledger(LedgerInfo)



export { ledgerWallet }

