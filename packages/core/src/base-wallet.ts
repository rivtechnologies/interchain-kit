import { StdSignDoc } from '@interchainjs/types';
import { BroadcastMode, DirectSignDoc, SignOptions, SimpleAccount, Wallet, WalletAccount, WalletEvents, WalletState } from "./types";
import EventEmitter from "events";
import { ChainInfo } from '@keplr-wallet/types'
import {
  OfflineAminoSigner,
  OfflineDirectSigner,
  AminoSignResponse, StdSignature, DirectSignResponse
} from '@interchainjs/cosmos/types/wallet';

export abstract class BaseWallet {

  info?: Wallet

  walletState: WalletState;

  errorMessage: string;

  events = new EventEmitter<WalletEvents>();

  constructor(info?: Wallet) {
    this.info = info
  }

  abstract init(meta?: unknown): Promise<void>

  abstract connect(chainId: string | string[]): Promise<void>

  abstract disconnect(chainId: string | string[]): Promise<void>

  abstract getAccount(chainId: string): Promise<WalletAccount>

  abstract getAccounts(chainIds: string[]): Promise<WalletAccount[]>

  abstract getSimpleAccount(chainId: string): Promise<SimpleAccount>

  abstract getOfflineSignerAmino(chainId: string): OfflineAminoSigner

  abstract getOfflineSignerDirect(chainId: string): OfflineDirectSigner

  abstract signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<AminoSignResponse>

  abstract signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature>

  abstract verifyArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<boolean>

  abstract signDirect(chainId: string, signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions): Promise<DirectSignResponse>

  abstract sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array>

  abstract addSuggestChain(chainInfo: ChainInfo): Promise<void>
}