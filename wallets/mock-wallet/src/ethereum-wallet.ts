import { Chain } from '@chain-registry/types';
import { Wallet, WalletAccount, EthereumWallet } from "@interchain-kit/core";
import { ethers, HDNodeWallet, Wallet as EtherWallet, Eip1193Provider } from 'ethers';

export interface MockEthereumNetwork {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer?: string;
  currencySymbol: string;
  currencyDecimals: number;
}

export interface MockEthereumWalletOptions extends Wallet {
  mnemonic?: string;
  derivationPaths?: string[];
}

export class MockEthereumWallet extends EthereumWallet {
  private accounts: HDNodeWallet[] = [];
  private currentAccountIndex: number = 0;
  private currentChainId: number = 1; // Default to Ethereum mainnet
  private provider: Eip1193Provider | null = null;
  private signer: ethers.Wallet | null = null;
  private networks: MockEthereumNetwork[] = [];
  private mnemonic: string;
  private derivationPaths: string[];

  constructor(options: Wallet, mnemonic: string) {
    super(options);

    // 设置默认值
    this.mnemonic = mnemonic
    this.derivationPaths = [
      `44'/60'/0'/0/0`,  // 第一个钱包
      `44'/60'/0'/0/1`   // 第二个钱包
    ];

    this.initializeDefaultNetworks();
    this.initializeDefaultAccounts();
  }

  private initializeDefaultNetworks(): void {
    this.networks = [
      {
        chainId: 1,
        name: 'Ethereum Mainnet',
        rpcUrl: 'https://eth.llamarpc.com',
        blockExplorer: 'https://etherscan.io',
        currencySymbol: 'ETH',
        currencyDecimals: 18
      },
      {
        chainId: 5,
        name: 'Goerli Testnet',
        rpcUrl: 'https://eth-goerli.public.blastapi.io',
        blockExplorer: 'https://goerli.etherscan.io',
        currencySymbol: 'ETH',
        currencyDecimals: 18
      },
      {
        chainId: 11155111,
        name: 'Sepolia Testnet',
        rpcUrl: 'https://eth-sepolia.api.onfinality.io/public',
        blockExplorer: 'https://sepolia.etherscan.io',
        currencySymbol: 'ETH',
        currencyDecimals: 18
      },
      {
        chainId: 137,
        name: 'Polygon',
        rpcUrl: 'https://polygon-rpc.com',
        blockExplorer: 'https://polygonscan.com',
        currencySymbol: 'MATIC',
        currencyDecimals: 18
      },
      {
        chainId: 56,
        name: 'BNB Smart Chain',
        rpcUrl: 'https://bsc-dataseed.binance.org',
        blockExplorer: 'https://bscscan.com',
        currencySymbol: 'BNB',
        currencyDecimals: 18
      }
    ];
  }

  private initializeDefaultAccounts(): void {

    const hdNode = ethers.HDNodeWallet.fromPhrase(this.mnemonic);

    const wallet0 = hdNode.derivePath("44'/60'/0'/0/0");

    const wallet1 = hdNode.derivePath("44'/60'/0'/0/1");


    this.accounts.push(wallet0);
    this.accounts.push(wallet1);


  }

  async init(): Promise<void> {
    // Initialize with default network
    await this.switchChain(this.currentChainId.toString());
    return Promise.resolve();
  }

  async connect(chainId: string): Promise<void> {
    await this.switchChain(chainId);
    return Promise.resolve();
  }

  async disconnect(): Promise<void> {
    this.provider = null;
    this.signer = null;
    return Promise.resolve();
  }

  async switchChain(chainId: string): Promise<void> {
    const chainIdNum = parseInt(chainId, 10);
    const network = this.networks.find(n => n.chainId === chainIdNum);

    if (!network) {
      throw new Error(`Network with chainId ${chainId} not found`);
    }

    this.currentChainId = chainIdNum;
    this.provider = new ethers.JsonRpcProvider(network.rpcUrl);

    if (this.accounts.length > 0) {
      this.signer = new ethers.Wallet(
        this.accounts[this.currentAccountIndex].privateKey,
        this.provider
      );
    }

    console.log(`Switched to network: ${network.name} (${network.chainId})`);
  }

  async switchAccount(): Promise<void> {


    this.currentAccountIndex = this.currentAccountIndex === 0 ? 1 : 0;

    if (this.provider) {
      this.signer = new ethers.Wallet(
        this.accounts[this.currentAccountIndex].privateKey,
        this.provider
      );
    }

    this.events.emit('accountChanged', () => { })

    console.log(`Switched to account: ${this.accounts[this.currentAccountIndex].address}`);
  }

  async getAccount(): Promise<WalletAccount> {
    if (this.accounts.length === 0) {
      throw new Error('No accounts available');
    }

    const account = this.accounts[this.currentAccountIndex];

    return {
      address: account.address,
      pubkey: new Uint8Array(), // Ethereum doesn't use pubkey in the same way
      algo: 'eth_secp256k1',
      isNanoLedger: false,
      isSmartContract: false,
      username: `Account ${this.currentAccountIndex + 1}`
    };
  }

  async getAccounts(): Promise<HDNodeWallet[]> {
    return this.accounts;
  }

  async getCurrentAccount(): Promise<HDNodeWallet> {
    return this.accounts[this.currentAccountIndex];
  }

  async getCurrentNetwork(): Promise<MockEthereumNetwork> {
    const network = this.networks.find(n => n.chainId === this.currentChainId);
    if (!network) {
      throw new Error('Current network not found');
    }
    return network;
  }

  async getNetworks(): Promise<MockEthereumNetwork[]> {
    return this.networks;
  }

  async addNetwork(network: MockEthereumNetwork): Promise<void> {
    const existingNetwork = this.networks.find(n => n.chainId === network.chainId);
    if (existingNetwork) {
      throw new Error(`Network with chainId ${network.chainId} already exists`);
    }

    this.networks.push(network);
    console.log(`Added new network: ${network.name} (${network.chainId})`);
  }



  async setDerivationPaths(derivationPaths: string[]): Promise<void> {
    try {
      // 清空现有账户
      this.accounts = [];
      this.currentAccountIndex = 0;

      // 更新derivation paths
      this.derivationPaths = derivationPaths;

      // 使用现有的助记词和新的derivation paths创建账户
      this.derivationPaths.forEach((path, index) => {
        try {
          const hdNode = ethers.HDNodeWallet.fromPhrase(this.mnemonic);
          const wallet = hdNode.derivePath(path);
          this.accounts.push({
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: this.mnemonic
          });
          console.log(`Created wallet ${index + 1} with path ${path}: ${wallet.address}`);
        } catch (error) {
          console.error(`Failed to create wallet with path ${path}:`, error);
        }
      });

      console.log(`Successfully set derivation paths and created ${this.accounts.length} accounts`);
    } catch (error) {
      throw new Error(`Failed to set derivation paths: ${error}`);
    }
  }


  async getBalance(): Promise<string> {
    if (!this.signer) {
      throw new Error('No signer available');
    }

    const balance = await this.provider!.getBalance(this.signer.address);
    return ethers.formatEther(balance);
  }

  async sendTransaction(transaction: {
    from: string;
    to: string;
    value: string;
    data?: string;
    gasLimit?: string;
    gasPrice?: string;
  }): Promise<string> {
    if (!this.signer) {
      throw new Error('No signer available');
    }

    const tx = await this.signer.sendTransaction({
      from: transaction.from,
      to: transaction.to,
      value: transaction.value,
      // data: transaction.data || '0x',
      // gasLimit: transaction.gasLimit ? BigInt(transaction.gasLimit) : undefined,
      // gasPrice: transaction.gasPrice ? ethers.parseUnits(transaction.gasPrice, 'gwei') : undefined
    });

    console.log(`Transaction sent: ${tx.hash}`);
    return tx.hash;
  }

  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error('No signer available');
    }

    const signature = await this.signer.signMessage(message);
    console.log(`Message signed: ${signature}`);
    return signature;
  }

  async signTypedData(domain: any, types: any, value: any): Promise<string> {
    if (!this.signer) {
      throw new Error('No signer available');
    }

    const signature = await this.signer.signTypedData(domain, types, value);
    console.log(`Typed data signed: ${signature}`);
    return signature;
  }

  async getProvider(): Promise<Eip1193Provider | null> {
    return this.provider;
  }

  async getSigner(): Promise<ethers.Wallet | null> {
    return this.signer;
  }

  // Getter methods for mnemonic and derivation paths
  getMnemonic(): string {
    return this.mnemonic;
  }

  getDerivationPaths(): string[] {
    return [...this.derivationPaths]; // 返回副本，防止外部修改
  }

  getWalletInfo(): {
    mnemonic: string;
    derivationPaths: string[];
    accountCount: number;
    currentAccountIndex: number;
  } {
    return {
      mnemonic: this.mnemonic,
      derivationPaths: [...this.derivationPaths],
      accountCount: this.accounts.length,
      currentAccountIndex: this.currentAccountIndex
    };
  }
}