import { SolanaWallet, WalletAccount } from '@interchain-kit/core';
import Solana from '@ledgerhq/hw-app-solana';
import Transport from '@ledgerhq/hw-transport';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import { PublicKey, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';

export class LedgerSolanaWallet extends SolanaWallet {

  ledgerSolana: Solana;
  transport: Transport;

  path: string = "44'/501'/0'";

  async init() {
    return Promise.resolve();
  }

  async connect(chainId: string) {
    this.transport = await TransportWebHID.create();
    this.ledgerSolana = new Solana(this.transport);
    const address = await this.ledgerSolana.getAddress(this.path);


  }

  async getAccount(chainId: string): Promise<WalletAccount> {
    const { address } = await this.ledgerSolana.getAddress(this.path);

    return {
      address: bs58.encode(address as unknown as Uint8Array),
      pubkey: address as unknown as Uint8Array,
      isNanoLedger: true,
      algo: 'secp256k1'
    };

  }

  async disconnect(chainId: string) {
    await this.transport.close();
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {

    const { pubkey } = await this.getAccount('solana');

    const { signature } = await this.ledgerSolana.signTransaction(this.path, transaction.compileMessage().serialize());



    transaction.addSignature(new PublicKey(pubkey), signature);

    return transaction;
  }

}