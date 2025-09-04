import { MultiChainWallet } from '@interchain-kit/core';

import { LedgerCosmosWallet } from './cosmos';
import { LedgerInfo } from './registry';
import { LedgerSolanaWallet } from './solana';

export * from './constant';
export * from './registry';

const ledgerWallet = new MultiChainWallet(LedgerInfo);

ledgerWallet.setNetworkWallet('cosmos', new LedgerCosmosWallet(LedgerInfo));
ledgerWallet.setNetworkWallet('solana', new LedgerSolanaWallet(LedgerInfo));

export { ledgerWallet };

