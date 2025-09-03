import { Chain } from '@chain-registry/types';
import { BaseWallet, WalletAccount, WalletManager, WalletState } from '@interchain-kit/core';

import { InterchainStore } from '../store';
import { ChainWalletStore } from './chain-wallet-store';

export class WalletStore extends BaseWallet {

  wallet: BaseWallet;
  chains: Chain[];

  chainWalletStoreMap: Map<Chain['chainName'], ChainWalletStore> = new Map();

  store: InterchainStore;

  walletManager: WalletManager;

  constructor(wallet: BaseWallet, chains: Chain[], store: InterchainStore, walletManager: WalletManager) {
    super(wallet.info);
    this.wallet = wallet;
    this.chains = chains;

    chains.forEach(chain => {
      this.chainWalletStoreMap.set(chain.chainName, new ChainWalletStore(this.wallet, chain, store, walletManager));
    });

    this.store = store;
    this.walletManager = walletManager;
  }

  get walletState(): WalletState {
    const chainWalletStates: WalletState[] = [];

    this.store.getState().chainWalletStates.forEach(cws => {
      if (cws.walletName === this.info.name) {
        chainWalletStates.push(cws.walletState);
      }
    });
    if (chainWalletStates.some(ws => ws === WalletState.NotExist)) {
      return WalletState.NotExist;
    }
    if (chainWalletStates.some(ws => ws === WalletState.Connected)) {
      return WalletState.Connected;
    }
    if (chainWalletStates.some(ws => ws === WalletState.Connecting)) {
      return WalletState.Connecting;
    }
    return WalletState.Disconnected;

  }

  get errorMessage(): string {
    let errorMessage: string = '';

    for (const cws of this.store.getState().chainWalletStates) {
      if (cws.walletName === this.info.name) {
        errorMessage = cws.errorMessage;
        break;
      }
    }

    return errorMessage;
  }

  async init(): Promise<void> {

    try {

      const chainWalletStores = Array.from(this.chainWalletStoreMap.values());
      await Promise.all(chainWalletStores.map(chainWalletStore => chainWalletStore.init()));

      await this.wallet.init();

    } catch (error) {
      this.store.updateWalletState(this.wallet.info.name, { walletState: WalletState.NotExist, errorMessage: '' });
    }
  }

  getChainWalletStore(chainName: Chain['chainName']): ChainWalletStore {
    const chainWalletStore = this.chainWalletStoreMap.get(chainName);
    if (!chainWalletStore) {
      throw new Error(`Chain wallet store with chain name ${chainName} not found`);
    }
    return chainWalletStore;
  }

  async connect(chainId: Chain['chainId']): Promise<void> {
    const chain = this.walletManager.getChainById(chainId);
    if (!chain) {
      throw new Error(`Chain with ID ${chainId} not found`);
    }
    return this.getChainWalletStore(chain.chainName).connect();
  }
  async disconnect(chainId: Chain['chainId']): Promise<void> {
    const chain = this.walletManager.getChainById(chainId);
    if (!chain) {
      throw new Error(`Chain with ID ${chainId} not found`);
    }
    return this.getChainWalletStore(chain.chainName).disconnect();
  }
  async getAccount(chainId: Chain['chainId']): Promise<WalletAccount> {
    const chain = this.walletManager.getChainById(chainId);
    if (!chain) {
      throw new Error(`Chain with ID ${chainId} not found`);
    }
    return this.getChainWalletStore(chain.chainName).getAccount();
  }
  async addSuggestChain(chainId: Chain['chainId']): Promise<void> {
    const chain = this.walletManager.getChainById(chainId);
    if (!chain) {
      throw new Error(`Chain with ID ${chainId} not found`);
    }
    return this.getChainWalletStore(chain.chainName).addSuggestChain();
  }
  async getProvider(chainId: Chain['chainId']): Promise<any> {
    const chain = this.walletManager.getChainById(chainId);
    if (!chain) {
      throw new Error(`Chain with ID ${chainId} not found`);
    }
    return this.getChainWalletStore(chain.chainName).getProvider();
  }
}