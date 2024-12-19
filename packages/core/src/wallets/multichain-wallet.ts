
import { AssetList, Chain } from '@chain-registry/v2-types';
import { OfflineSigner } from '@interchainjs/cosmos/types/wallet';
import { SignType, Wallet, WalletAccount } from '../types';
import { BaseWallet } from './base-wallet';
import { CosmosWallet } from './cosmos-wallet';
import { EthereumWallet } from './ethereum-wallet';
import { isInstanceOf } from '../utils';

export class MultiChainWallet extends BaseWallet {

  networkWalletMap: Map<Chain['chainType'], BaseWallet> = new Map()
  chainMap: Map<Chain['chainId'], Chain> = new Map()

  constructor(info?: Wallet, networkWalletMap?: Map<Chain['chainType'], BaseWallet>) {
    super(info);

    this.networkWalletMap.set('cosmos', new CosmosWallet(info));
    this.networkWalletMap.set('eip155', new EthereumWallet(info));

    if (networkWalletMap) {
      networkWalletMap.forEach((wallet, key) => {
        if (this.networkWalletMap.has(key)) {
          this.networkWalletMap.set(key, wallet);
        }
      })
    }
  }

  setNetworkWallet(chainType: Chain['chainType'], wallet: BaseWallet): void {
    this.networkWalletMap.set(chainType, wallet);
  }

  setChainMap(chains: Chain[]): void {
    this.chainMap = new Map(chains.map(chain => [chain.chainId, chain]))
    this.networkWalletMap.forEach(wallet => {
      wallet.setChainMap(chains)
    })
  }

  setAssetLists(assetLists: AssetList[]): void {
    this.networkWalletMap.forEach(wallet => {
      wallet.setAssetLists(assetLists)
    })
  }

  async init(): Promise<void> {
    const wallets = Array.from(this.networkWalletMap.values());

    await Promise.all(wallets.map(async wallet => wallet.init())).catch(error => {
      this.errorMessage = (error as any).message
    })
  }
  getWalletByChainType(chainType: Chain['chainType']) {
    return this.networkWalletMap.get(chainType);
  }
  async connect(chainId: Chain['chainId'] | Chain['chainId'][]): Promise<void> {
    const chainIds = Array.isArray(chainId) ? chainId : [chainId];
    await Promise.all(chainIds.map(async chainId => {
      try {
        const chain = this.getChainById(chainId);
        const networkWallet = this.getWalletByChainType(chain.chainType);
        await networkWallet.connect(chainId);
      } catch (error) {
        this.errorMessage = (error as any).message
        await this.addSuggestChain(chainId as string)
      }
    }))
  }
  async disconnect(chainId: Chain['chainId'] | Chain['chainId'][]): Promise<void> {
    const chainIds = Array.isArray(chainId) ? chainId : [chainId];
    await Promise.all(chainIds.map(async chainId => {
      try {
        const chain = this.getChainById(chainId);
        const networkWallet = this.getWalletByChainType(chain.chainType);
        await networkWallet.disconnect(chainId);
      } catch (error) {
        this.errorMessage = (error as any).message
      }
    }))
  }
  async getAccount(chainId: Chain['chainId']): Promise<WalletAccount> {
    const chain = this.getChainById(chainId);
    const networkWallet = this.getWalletByChainType(chain.chainType);
    if (!networkWallet) {
      return Promise.reject(new Error('Unsupported chain type'))
    }
    return networkWallet.getAccount(chainId);
  }
  async getOfflineSigner(chainId: Chain['chainId'], preferSignType?: SignType) {
    const chain = this.getChainById(chainId);
    const networkWallet = this.getWalletByChainType(chain.chainType);
    if (isInstanceOf(networkWallet, CosmosWallet) && preferSignType) {
      return networkWallet.getOfflineSigner(chainId, preferSignType);
    }
    return networkWallet.getOfflineSigner(chainId);
  }
  async addSuggestChain(chainId: string): Promise<void> {
    const chain = this.chainMap.get(chainId);
    const networkWallet = this.getWalletByChainType(chain.chainType);
    return networkWallet.addSuggestChain(chainId);
  }
}