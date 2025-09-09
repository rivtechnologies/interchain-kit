import { Algo, CosmosWallet, MultiChainWallet, Wallet } from '@interchain-kit/core';
import { Secp256k1HDWallet } from '@interchainjs/cosmos/wallets/secp256k1hd';
import { generateMnemonic } from '@interchainjs/crypto';

const hdPath = "m/44'/118'/0'/0/0";

export class MultipleAccountCosmosWallet extends CosmosWallet {
  currentAccountIndex: '1' | '2' = '1';
  accountWalletMap: Record<'1' | '2', Record<string, Secp256k1HDWallet>> = {
    1: {},
    2: {},
  };

  getCurrentAccountWallet(chainName: string): Secp256k1HDWallet {
    const wallet = this.accountWalletMap[this.currentAccountIndex][chainName];
    if (!wallet) {
      throw new Error(`No wallet found for chainName: ${chainName} and account index: ${this.currentAccountIndex}`);
    }
    return wallet;
  }

  changeWalletAccount() {
    this.currentAccountIndex = this.currentAccountIndex === '1' ? '2' : '1';
    //@ts-ignore
    window.dispatchEvent(new CustomEvent(this.info.keystoreChange));
  }

  async init() {

    const chains = Array.from(this.chainMap.values());

    for (const chain of chains) {
      const wallet1 = await Secp256k1HDWallet.fromMnemonic(generateMnemonic(), {
        derivations: [{
          prefix: chain.bech32Prefix || 'osmosis',
          hdPath: hdPath
        }]
      });
      const wallet2 = await Secp256k1HDWallet.fromMnemonic(generateMnemonic(), {
        derivations: [{
          prefix: chain.bech32Prefix || 'osmosis',
          hdPath: hdPath
        }]
      });
      this.accountWalletMap['1'][chain.chainName] = wallet1;
      this.accountWalletMap['2'][chain.chainName] = wallet2;
    }
    //@ts-ignore
    window[this.info.windowKey] = {};
    //@ts-ignore
    window[this.info.cosmosKey] = {};


    return super.init();
  }

  connect() {
    return Promise.resolve();
  }

  disconnect() {
    return Promise.resolve();
  }

  async getAccount(chainId: string) {
    const chain = this.getChainById(chainId);
    const wallet = this.getCurrentAccountWallet(chain.chainName);
    const accounts = await (await wallet.toOfflineDirectSigner()).getAccounts();
    return {
      address: accounts[0].address,
      algo: accounts[0].algo as Algo,
      pubkey: accounts[0].pubkey as Uint8Array,
      username: `Account ${this.currentAccountIndex}`,
      isNanoLedger: false,
      isSmartContract: false,
    };
  }

  async signAmino(chainId: string, signerAddress: string, signDoc: any) {
    const chain = this.getChainById(chainId);
    const wallet = this.getCurrentAccountWallet(chain.chainName);
    return wallet.signAmino(signerAddress, signDoc);
  }

  async signDirect(chainId: string, signerAddress: string, signDoc: any) {
    const chain = this.getChainById(chainId);
    const wallet = this.getCurrentAccountWallet(chain.chainName);
    return wallet.signDirect(signerAddress, signDoc);
  }

}

const multipleAccountWalletConfig: Wallet = {
  windowKey: 'mock-multiple-account-wallet',
  cosmosKey: 'mock-multiple-account-cosmos-wallet',
  name: 'multiple-account-wallet',
  mode: 'extension',
  prettyName: 'Multiple Account Wallet',
  keystoreChange: 'multipleMockAccountChange',
  downloads: []
};

export const multipleAccountWallet = new MultiChainWallet(multipleAccountWalletConfig);

multipleAccountWallet.setNetworkWallet('cosmos', new MultipleAccountCosmosWallet(multipleAccountWalletConfig));