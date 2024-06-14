import { AccountData } from "@cosmjs/amino";
import { DappEnv, OS } from "./common";

export interface DownloadInfo extends DappEnv {
  icon?: string;
  link: string;
}

export type WalletMode =
  | 'ledger'
  | 'extension'
  | 'wallet-connect'
  | 'social-login';

export interface AppUrl {
  native?:
  | string
  | {
    android?: string;
    ios?: string;
    macos?: string;
    windows?: string;
  };
  universal?: string;
}

export interface Wallet {
  windowKey: string,
  name: string;
  prettyName: string;
  description?: string;
  keystoreChange?: string;
  downloads?: DownloadInfo[];
  logo?: string | { major: string; minor: string };
}

export interface DirectSignDoc {
  /** SignDoc bodyBytes */
  bodyBytes: Uint8Array | null;
  /** SignDoc authInfoBytes */
  authInfoBytes: Uint8Array | null;
  /** SignDoc chainId */
  chainId: string | null;
  /** SignDoc accountNumber */
  accountNumber: bigint | null;
}

export interface SignOptions {
  readonly preferNoSetFee?: boolean;
  readonly preferNoSetMemo?: boolean;
  readonly disableBalanceCheck?: boolean;
}

export interface WalletAccount extends AccountData {
  username?: string;
  isNanoLedger?: boolean;
  isSmartContract?: boolean;
}

export declare enum BroadcastMode {
  /** Return after tx commit */
  Block = 'block',
  /** Return after CheckTx */
  Sync = 'sync',
  /** Return right away */
  Async = 'async',
}