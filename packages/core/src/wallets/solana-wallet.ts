import { Chain } from '@chain-registry/types';

import { Wallet, WalletAccount } from '../types';
import { SolanaSignInData, Transaction, VersionedTransaction } from '../types/solana';
import { ISolanaWallet } from '../types/wallet-types';
import { getClientFromExtension } from '../utils';
import { BaseWallet } from './base-wallet';

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

    this.solana = await getClientFromExtension(this.info.solanaKey);
    this.bindingEvent();
  }


  async connect(chainId: Chain['chainId']): Promise<void> {

    try {
      await this.solana.connect();
    } catch (error) {
      console.log(error);
    }

  }

  async addSuggestChain(chainId: Chain['chainId']): Promise<void> {
    throw new Error('Solana does not support suggest chain');
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

  async signMessage(message: Uint8Array, encoding: 'utf8' | 'hex' = 'utf8'): Promise<any> {
    return this.solana.signMessage(message, encoding);
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    return this.solana.signTransaction(transaction);
  }
}
