import { WalletAccount } from "../../types";
import { WalletConnectIcon } from "../../constant";
import { ISolanaWallet } from "../../types/wallet-types";
import { IWCCommon } from "./wc-common";
import { Chain } from "@chain-registry/types";
import UniversalProvider from "@walletconnect/universal-provider";
import { BaseWallet } from "../base-wallet";
import { WCWallet } from "./wc-wallet";
import { SolanaWallet } from "../solana-wallet";

export class WCSolanaWallet extends SolanaWallet implements IWCCommon {
  provider: UniversalProvider;
  wcWallet: WCWallet;

  constructor() {
    super({
      name: 'WalletConnect',
      prettyName: 'Wallet Connect',
      mode: 'wallet-connect',
      logo: WalletConnectIcon
    });
  }

  setWCWallet(wallet: WCWallet): void {
    this.wcWallet = wallet;
  }

  getWCWallet(): WCWallet {
    return this.wcWallet;
  }

  setWCProvider(provider: UniversalProvider): void {
    this.provider = provider;
  }

  getWCProvider(): UniversalProvider {
    return this.provider;
  }

  bindingEvent(): void {
    // Event binding is handled by the parent WCWallet
    // This method can be extended if needed
  }

  async init(): Promise<void> {
    // Initialization is handled by the parent WCWallet
    return Promise.resolve();
  }

  async connect(chainId: Chain["chainId"]): Promise<void> {
    return this.wcWallet.connect(chainId);
  }

  async disconnect(chainId: Chain["chainId"]): Promise<void> {
    return this.wcWallet.disconnect();
  }

  async getAccount(chainId: Chain["chainId"]): Promise<WalletAccount> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const accounts = await this.provider.request({
        method: 'solana_accounts',
        params: []
      }, `solana:${chainId}`) as string[];

      return {
        address: accounts[0],
        algo: 'secp256k1', // Solana uses ed25519 but we'll use secp256k1 for compatibility
        pubkey: null,
        username: '',
        isNanoLedger: null,
        isSmartContract: null
      };
    } catch (error) {
      console.log('get solana account error', error);
      throw error;
    }
  }

  async addSuggestChain(chainId: Chain["chainId"]): Promise<void> {
    // Solana chain addition is typically handled by the wallet
    throw new Error("Method not implemented.");
  }

  async getProvider(chainId: Chain["chainId"]): Promise<any> {
    return this.provider;
  }

  async request(method: string, params: any): Promise<any> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      return await this.provider.request({
        method,
        params: params || []
      });
    } catch (error) {
      console.log('request error:', error);
      throw error;
    }
  }

  async signAllTransactions(transactions: any[]): Promise<any[]> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const result = await this.provider.request({
        method: 'solana_signAllTransactions',
        params: { transactions }
      }) as any[];
      return result;
    } catch (error) {
      console.log('sign all transactions error:', error);
      throw error;
    }
  }

  async signAndSendAllTransactions(transactions: any[]): Promise<any> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const result = await this.provider.request({
        method: 'solana_signAndSendAllTransactions',
        params: { transactions }
      });
      return result;
    } catch (error) {
      console.log('sign and send all transactions error:', error);
      throw error;
    }
  }

  async signAndSendTransaction(transaction: any): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const result = await this.provider.request({
        method: 'solana_signAndSendTransaction',
        params: { transaction }
      }) as string;
      return result;
    } catch (error) {
      console.log('sign and send transaction error:', error);
      throw error;
    }
  }

  async signIn(data: any): Promise<{ address: string; signature: Uint8Array; signedMessage: Uint8Array }> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const result = await this.provider.request({
        method: 'solana_signIn',
        params: { data }
      }) as { address: string; signature: Uint8Array; signedMessage: Uint8Array };
      return result;
    } catch (error) {
      console.log('sign in error:', error);
      throw error;
    }
  }

  async signMessage(message: Uint8Array, encoding?: 'utf8' | 'hex'): Promise<Uint8Array> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const result = await this.provider.request({
        method: 'solana_signMessage',
        params: { message, encoding }
      }) as Uint8Array;
      return result;
    } catch (error) {
      console.log('sign message error:', error);
      throw error;
    }
  }

  async signTransaction(transaction: any): Promise<any> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const result = await this.provider.request({
        method: 'solana_signTransaction',
        params: { transaction }
      });
      return result;
    } catch (error) {
      console.log('sign transaction error:', error);
      throw error;
    }
  }
}
