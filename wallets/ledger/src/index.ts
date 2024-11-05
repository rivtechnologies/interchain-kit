import { LedgerWallet } from './ledger';
import { LedgerInfo } from './registry';

export * from './registry'
export * from './constant'

const ledgerWallet = new LedgerWallet(LedgerInfo)

export { ledgerWallet }

