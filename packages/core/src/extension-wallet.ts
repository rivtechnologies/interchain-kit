import { Algo, OfflineAminoSigner, StdSignature, StdSignDoc } from "@cosmjs/amino";
import { OfflineDirectSigner } from '@cosmjs/proto-signing';
import { BroadcastMode, DirectSignDoc, SignOptions, Wallet, WalletAccount } from "./types";
import Long from 'long';
import { getClientFromExtension } from './utils';
import { Keplr } from '@keplr-wallet/types';
import { BaseWallet } from "./base-wallet";


export class ExtensionWallet extends BaseWallet<Keplr> {
  client: Keplr;
  defaultSignOptions = {
    preferNoSetFee: false,
    preferNoSetMemo: true,
    disableBalanceCheck: true,
  }
  option: Wallet
  constructor({ option }: { option: Wallet }) {
    super()
    this.option = option
  }

  async init() {
    this.client = await getClientFromExtension(this.option.windowKey)
  }

  async enable(chainId: string | string[]) {
    await this.client.enable(chainId)
  }

  async disable(chainId: string | string[]) {
    await this.client.disable(chainId)
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

  async getSimpleAccount(chainId: string) {
    const { address, username } = await this.getAccount(chainId);
    return {
      namespace: 'cosmos',
      chainId,
      address,
      username,
    };
  }

  getOfflineSignerAmino(chainId: string): OfflineAminoSigner {
    return {
      getAccounts: async () => {
        return [await this.getAccount(chainId)];
      },
      signAmino: async (signerAddress, signDoc) => {
        return this.signAmino(
          chainId,
          signerAddress,
          signDoc,
          this.defaultSignOptions
        );
      },
    };
    // return this.client.getOfflineSignerOnlyAmino(chainId);
  }

  getOfflineSignerDirect(chainId: string): OfflineDirectSigner {
    return {
      getAccounts: async () => {
        return [await this.getAccount(chainId)];
      },
      signDirect: async (signerAddress, signDoc) => {
        const resp = await this.signDirect(
          chainId,
          signerAddress,
          signDoc,
          this.defaultSignOptions
        );
        return {
          ...resp,
          signed: {
            ...resp.signed,
            accountNumber: BigInt(resp.signed.accountNumber.toString()),
          },
        };
      },
    };
    // return this.client.getOfflineSigner(chainId) as OfflineDirectSigner;
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions?: SignOptions
  ) {
    return await this.client.signAmino(
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
    return await this.client.signArbitrary(chainId, signer, data);
  }

  async signDirect(
    chainId: string,
    signer: string,
    signDoc: DirectSignDoc,
    signOptions?: SignOptions
  ) {
    const resp = await this.client.signDirect(
      chainId,
      signer,
      {
        ...signDoc,
        accountNumber: Long.fromString(signDoc.accountNumber.toString()),
      },
      signOptions || this.defaultSignOptions
    );
    return {
      ...resp,
      signed: {
        ...resp.signed,
        accountNumber: BigInt(resp.signed.accountNumber.toString()),
      },
    };
  }

  async sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode) {
    return await this.client.sendTx(chainId, tx, mode);
  }


}