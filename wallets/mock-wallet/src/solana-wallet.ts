import { SolanaWallet, Wallet, WalletAccount } from '@interchain-kit/core';
import { Connection, Keypair, LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import * as bip39 from 'bip39';
import bs58 from 'bs58';
import { derivePath } from 'ed25519-hd-key';
import * as nacl from 'tweetnacl';

// 定义 SignIn 参数接口
interface SignInParams {
  domain?: string;
  statement?: string;
  uri?: string;
  version?: string;
  chainId?: string;
  nonce?: string;
  issuedAt?: string;
  expirationTime?: string;
}

// 定义 SignIn 返回值接口
interface SignInResult {
  signedMessage: string;
  signature: string;
  publicKey: string;
}

// 定义 SignMessage 返回值接口
interface SignMessageResult {
  signature: string;
  publicKey: string;
}

export class MockSolanaWallet extends SolanaWallet {
  private connection: Connection;
  public isConnected: boolean;
  public derivationPath1 = "m/44'/501'/0'/0'";
  public derivationPath2 = "m/44'/501'/1'/0'";


  currentKeypairIndex: '1' | '2' = '1';

  keypairMap: Record<'1' | '2', Keypair> = {
    1: {} as Keypair,
    2: {} as Keypair,
  };

  constructor(network: 'mainnet-beta' | 'devnet' | 'testnet' = 'devnet', info: Wallet, mnemonic?: string) {
    super(info);


    // 如果提供了助记词，从助记词派生密钥对
    if (mnemonic) {
      if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error('Invalid mnemonic phrase');
      }
      const seed = bip39.mnemonicToSeedSync(mnemonic);
      const derivedSeed1 = derivePath(this.derivationPath1, seed.toString('hex')).key;
      this.keypairMap['1'] = Keypair.fromSeed(derivedSeed1);

      const derivedSeed2 = derivePath(this.derivationPath2, seed.toString('hex')).key;
      this.keypairMap['2'] = Keypair.fromSeed(derivedSeed2);

    } else {
      // 否则随机生成密钥对
      this.keypairMap['1'] = Keypair.generate();
      this.keypairMap['2'] = Keypair.generate();
    }

    this.connection = new Connection(`https://api.${network}.solana.com`, 'confirmed');
    this.isConnected = false;
  }

  async init(): Promise<void> {
    //@ts-ignore1
    window[this.info.windowKey] = {}
    //@ts-ignore
    window[this.info.solanaKey] = {}

    await super.init();
  }

  getCurrentKeypair(): Keypair {
    const keypair = this.keypairMap[this.currentKeypairIndex];
    if (!keypair) {
      throw new Error(`No keypair found for account index: ${this.currentKeypairIndex}`);
    }
    return keypair;
  }

  changeWalletAccount() {
    this.currentKeypairIndex = this.currentKeypairIndex === '1' ? '2' : '1';
    //@ts-ignore
    window.dispatchEvent(new CustomEvent(this.info.keystoreChange));
    console.log('trigger in mock solana wallet')
  }


  // 模拟 Phantom 的 connect 方法
  async connect(chainId: string): Promise<void> {
    this.isConnected = true;
    return Promise.resolve();
  }

  // 模拟 Phantom 的 disconnect 方法
  async disconnect(chainId: string): Promise<void> {
    this.isConnected = false;
    return Promise.resolve();
  }

  async getAccount(chainId: string): Promise<WalletAccount> {
    const keypair = this.getCurrentKeypair();
    return {
      address: keypair.publicKey.toBase58(),
      algo: 'secp256k1',
      pubkey: keypair.publicKey.toBytes()
    };
  }


  // 模拟 Sign In With Solana (SIWS)
  async signIn(params: SignInParams = {}): Promise<SignInResult> {
    if (!this.isConnected) {
      throw new Error('Wallet not connected.');
    }

    const keypair = this.getCurrentKeypair();

    const {
      domain = 'my-dapp.com',
      statement = 'Login to My dApp',
      uri = 'https://my-dapp.com/login',
      version = '1',
      chainId = 'solana:devnet',
      nonce = Math.random().toString(36).substring(2, 10),
      issuedAt = new Date().toISOString(),
      expirationTime = new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    } = params;

    const message = `${domain} wants you to sign in with your Solana account:
${keypair.publicKey.toBase58()}

Statement: ${statement}
URI: ${uri}
Version: ${version}
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}
Expiration Time: ${expirationTime}`;

    const messageBytes = new TextEncoder().encode(message);
    const signature = nacl.sign.detached(messageBytes, keypair.secretKey);

    return {
      signedMessage: message,
      signature: bs58.encode(signature),
      publicKey: keypair.publicKey.toBase58(),
    };
  }

  // 模拟 signMessage
  async signMessage(message: string): Promise<SignMessageResult> {
    if (!this.isConnected) {
      throw new Error('Wallet not connected.');
    }
    const messageBytes = new TextEncoder().encode(message);
    const keypair = this.getCurrentKeypair();
    const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
    return {
      signature: bs58.encode(signature),
      publicKey: keypair.publicKey.toBase58(),
    };
  }

  // 模拟 signTransaction
  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this.isConnected) {
      throw new Error('Wallet not connected.');
    }
    if (!(transaction instanceof Transaction)) {
      throw new Error('Invalid transaction');
    }
    const keypair = this.getCurrentKeypair();
    transaction.partialSign(keypair);
    return transaction;
  }

  // 模拟 signAllTransactions
  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    if (!this.isConnected) {
      throw new Error('Wallet not connected.');
    }
    if (!Array.isArray(transactions)) {
      throw new Error('Invalid transactions array');
    }
    return transactions.map((tx) => {
      if (!(tx instanceof Transaction)) throw new Error('Invalid transaction');
      const keypair = this.getCurrentKeypair();
      tx.partialSign(keypair);
      return tx;
    });
  }

  // 模拟 signAndSendTransaction
  async signAndSendTransaction(transaction: Transaction): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Wallet not connected.');
    }
    if (!(transaction instanceof Transaction)) {
      throw new Error('Invalid transaction');
    }
    const keypair = this.getCurrentKeypair();
    transaction.partialSign(keypair);
    const signature = await this.connection.sendTransaction(transaction, [keypair]);
    await this.connection.confirmTransaction(signature);
    return signature;
  }

  // 模拟 signAndSendAllTransactions
  async signAndSendAllTransactions(transactions: Transaction[]): Promise<string[]> {
    if (!this.isConnected) {
      throw new Error('Wallet not connected.');
    }
    if (!Array.isArray(transactions)) {
      throw new Error('Invalid transactions array');
    }
    const signatures: string[] = [];
    for (const tx of transactions) {
      if (!(tx instanceof Transaction)) throw new Error('Invalid transaction');
      const keypair = this.getCurrentKeypair();
      tx.partialSign(keypair);
      const signature = await this.connection.sendTransaction(tx, [keypair]);
      await this.connection.confirmTransaction(signature);
      signatures.push(signature);
    }
    return signatures;
  }

  // 获取余额
  async getBalance(): Promise<number> {
    try {

      const keypair = this.getCurrentKeypair();
      const balance = await this.connection.getBalance(keypair.publicKey);

      return balance;
    } catch (error) {
      console.error('Error getting balance:', error);
    }
  }

  // 请求空投（仅限 devnet/testnet）
  async requestAirdrop(lamports: number = LAMPORTS_PER_SOL): Promise<string> {
    const keypair = this.getCurrentKeypair();
    const signature = await this.connection.requestAirdrop(keypair.publicKey, lamports);
    await this.connection.confirmTransaction(signature);
    return signature;
  }
}



