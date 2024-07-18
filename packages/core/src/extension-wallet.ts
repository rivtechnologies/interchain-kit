import { Algo, StdSignature, StdSignDoc } from "@cosmjs/amino";
import { OfflineDirectSigner } from '@cosmjs/proto-signing';
import { BroadcastMode, DirectSignDoc, Key, SignOptions, SignType, Wallet, WalletAccount } from "./types";
import Long from 'long';
import { clientNotExistError, getClientFromExtension } from './utils';
import { BaseWallet } from "./base-wallet";


export class ExtensionWallet extends BaseWallet {
  isExtensionInstalled: boolean = false;

  defaultSignOptions = {
    preferNoSetFee: false,
    preferNoSetMemo: true,
    disableBalanceCheck: true,
  }

  constructor(option: Wallet) {
    super(option)
  }

  async init() {
    try {
      this.client = await getClientFromExtension(this.option.windowKey)
      this.isExtensionInstalled = true
      window.addEventListener(this.option.keystoreChange, (event) => {
        this.events.emit('keystoreChange', event)
      })
    } catch (error) {
      if (error === clientNotExistError.message) {
        this.isExtensionInstalled = false;
      }
    }
  }

  async enable(chainId: string | string[]) {
    await this.client.enable(chainId)
  }

  async disable(chainId: string | string[]) {
    await this.client.disable(chainId)
  }

  async getSimpleAccount(chainId: string) {
    const { address, username } = await this.getAccount(chainId);
    return {
      namespace: 'cosmos',
      chainId,
      address,
      username,
    };
  }

  async getAccount(chainId: string): Promise<WalletAccount> {
    const key = await this.client.getKey(chainId);
    return {
      username: key.name,
      address: key.bech32Address,
      algo: key.algo as Algo,
      pubkey: key.pubKey,
      isNanoLedger: key.isNanoLedger,
    };
  }

  async getAccounts(chainIds: string[]): Promise<WalletAccount[]> {
    return Promise.all(chainIds.map(async chainId => {
      const key = await this.client.getKey(chainId)
      return {
        username: key.name,
        address: key.bech32Address,
        algo: key.algo as Algo,
        pubkey: key.pubKey,
        isNanoLedger: key.isNanoLedger,
      };
    }))
  }

  getOfflineSigner(chainId: string, preferredSignType?: SignType) {
    switch (preferredSignType) {
      case 'amino':
        return this.getOfflineSignerAmino(chainId);
      case 'direct':
        return this.getOfflineSignerDirect(chainId);
      default:
        return this.getOfflineSignerAmino(chainId);
    }
    // return this.client.getOfflineSignerAuto(chainId);
  }

  getOfflineSignerAmino(chainId: string) {
    return this.client.getOfflineSignerOnlyAmino(chainId);
  }

  getOfflineSignerDirect(chainId: string) {
    return this.client.getOfflineSigner(chainId) as OfflineDirectSigner;
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions?: SignOptions
  ) {
    return this.client.signAmino(
      chainId,
      signer,
      signDoc,
      signOptions || this.defaultSignOptions
    );
  }

  async signArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array
  ): Promise<StdSignature> {
    return this.client.signArbitrary(chainId, signer, data);
  }

  async signDirect(
    chainId: string,
    signer: string,
    signDoc: DirectSignDoc,
    signOptions?: SignOptions
  ) {
    return this.client.signDirect(
      chainId,
      signer,
      {
        ...signDoc,
        accountNumber: Long.fromString(signDoc.accountNumber.toString()),
      },
      signOptions || this.defaultSignOptions
    );
  }

  async sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode) {
    return this.client.sendTx(chainId, tx, mode);
  }

  sign(chainId: string, message: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
}