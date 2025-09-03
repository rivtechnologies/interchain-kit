import { Chain } from '@chain-registry/types';

import { ISolanaWallet, SignType, Wallet, WalletAccount } from '../types';
import { getClientFromExtension } from '../utils';
import { BaseWallet } from './base-wallet';

import { OfflineAminoSigner, OfflineDirectSigner } from '../types/cosmos';
import { Transaction, TransactionSignature, VersionedTransaction } from '@solana/web3.js';
import { SolanaSignInData } from '../types/solana';

function publicKeyToUint8Array(publicKey: any): Uint8Array {
  if (publicKey?.toBytes) return publicKey.toBytes();
  if (publicKey?.toBuffer) return new Uint8Array(publicKey.toBuffer());
  if (publicKey instanceof Uint8Array) return publicKey;
  if (typeof publicKey === 'string') {
    // 简单处理，实际建议用 base58 解码
    return new TextEncoder().encode(publicKey);
  }
  return new Uint8Array();
}

export class SolanaWallet extends BaseWallet implements ISolanaWallet {
  solana: any;

  constructor(info: Wallet) {
    super(info);
  }
  bindingEvent() {
    window.addEventListener(this.info.keystoreChange, () => {
      this.events.emit('accountChanged', () => { });
    });
  }
  async init(): Promise<void> {
    this.bindingEvent();
    this.solana = await getClientFromExtension(this.info.solanaKey);
  }


  async connect(chainId: Chain['chainId']): Promise<void> {

    try {
      await this.solana.connect();
    } catch (error) {
      console.log(error);
    }

  }

  async disconnect(chainId: Chain['chainId']): Promise<void> {

    await this.solana.disconnect();
  }

  async getAccount(chainId: Chain['chainId']): Promise<WalletAccount> {
    if (!this.solana || !this.solana.publicKey) throw new Error('Not connected');
    return {
      address: this.solana.publicKey.toString(),
      pubkey: publicKeyToUint8Array(this.solana.publicKey),
      // 只能用'secp256k1'或'eth_secp256k1'，实际Solana是ed25519，但类型限制只能兼容
      algo: 'secp256k1',
      username: 'solana',
      isNanoLedger: false,
      isSmartContract: false,
    };
  }

  async getOfflineSigner(chainId: Chain['chainId'], preferredSignType?: SignType): Promise<OfflineAminoSigner | OfflineDirectSigner> {
    throw new Error('Solana does not support getOfflineSigner');
  }

  async addSuggestChain(chainId: Chain['chainId']): Promise<void> {
    throw new Error('Solana does not support suggest chain');
  }

  async getProvider(chainId: Chain['chainId']): Promise<any> {
    return this.solana;
  }


  //solana provider methods
  async request(method: string, params: any): Promise<any> {

    return this.solana.request({
      method,
      params
    });
  }

  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {

    return this.solana.signAllTransactions(transactions);
  }

  async signAndSendAllTransactions(transactions: Transaction[]): Promise<any> {

    return this.solana.signAndSendAllTransactions(transactions);
  }

  async signAndSendTransaction(transaction: Transaction | VersionedTransaction): Promise<string> {
    const result = await this.solana.signAndSendTransaction(transaction);
    return result.signature;
  }

  async signIn(data: SolanaSignInData): Promise<{ address: string; signature: Uint8Array; signedMessage: Uint8Array }> {

    return this.solana.signIn(data);
  }

  async signMessage(message: Uint8Array, encoding: 'utf8' | 'hex' = 'utf8'): Promise<Uint8Array> {

    return this.solana.signMessage(message, encoding);
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {

    return this.solana.signTransaction(transaction);
  }
}
