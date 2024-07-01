import { AminoSignResponse, OfflineAminoSigner, StdSignature, StdSignDoc } from "@cosmjs/amino";
import { BroadcastMode, DirectSignDoc, SignOptions, SimpleAccount, Wallet, WalletAccount } from "./types";
import { DirectSignResponse, OfflineDirectSigner } from "@cosmjs/proto-signing";

export abstract class BaseWallet {

  option?: Wallet

  client: any;

  constructor(option?: Wallet) {
    this.option = option
  }

  abstract init(meta?: unknown): Promise<void>

  abstract enable(chainId: string | string[]): Promise<void>

  abstract disable(chainId: string | string[]): Promise<void>

  abstract getAccount(chainId: string): Promise<WalletAccount>

  abstract getSimpleAccount(chainId: string): Promise<SimpleAccount>

  abstract getOfflineSignerAmino(chainId: string): OfflineAminoSigner

  abstract getOfflineSignerDirect(chainId: string): OfflineDirectSigner

  abstract signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions?: SignOptions
  ): Promise<AminoSignResponse>

  abstract signArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array
  ): Promise<StdSignature>

  abstract signDirect(
    chainId: string,
    signer: string,
    signDoc: DirectSignDoc,
    signOptions?: SignOptions
  ): Promise<DirectSignResponse>

  abstract sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array>
}