import { AccountData } from "@cosmjs/amino";
import { DappEnv, OS } from "./common";
import { BaseWallet } from "../base-wallet";

export interface Key {
  readonly name: string;
  readonly algo: string;
  readonly pubKey: Uint8Array;
  readonly address: Uint8Array;
  readonly bech32Address: string;
  readonly isNanoLedger: boolean;
  readonly isSmartContract?: boolean;
}

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
  windowKey?: string,
  name: string;
  mode: WalletMode;
  prettyName: string;
  description?: string;
  keystoreChange?: string;
  downloads?: DownloadInfo[];
  logo?: string | { major: string; minor: string };
  walletconnect?: {
    name: string;
    projectId: string;
    requiredNamespaces?: {
      methods: string[];
      events: string[];
    };
    encoding?: BufferEncoding; // encoding for bytes, default 'hex'
    mobile?: AppUrl; // redirect link on mobile
    formatNativeUrl?: (
      appUrl: string,
      wcUri: string,
      os: OS | undefined,
      name: string
    ) => string;
    formatUniversalUrl?: (
      appUrl: string,
      wcUri: string,
      name: string
    ) => string;
  };
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

export interface SimpleAccount {
  namespace: string;
  chainId: string;
  address: string;
  username?: string;
}


export class WalletList<T extends BaseWallet> {

}