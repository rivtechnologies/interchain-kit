
import { BaseWallet, clientNotExistError, CosmosWallet, EthereumWallet, ExtensionWallet, isInstanceOf, MultiChainWallet, OfflineAminoSigner, OfflineDirectSigner, WalletAccount, WalletState, WCWallet } from "@interchain-kit/core"
import { InterchainStore } from "./store"
import { Chain } from "@chain-registry/types"
import { isSameConstructor } from "../utils/isSameConstructor"

export class StatefulWallet extends BaseWallet {
  originalWallet: BaseWallet
  walletName: string
  get: () => InterchainStore

  constructor(
    wallet: BaseWallet,
    get: () => InterchainStore
  ) {
    super(wallet.info)
    this.originalWallet = wallet
    this.walletName = wallet.info.name
    this.get = get
  }

  get store(): InterchainStore {
    return this.get();
  }

  get walletState(): WalletState {
    // 獲取此錢包在所有鏈上的狀態
    const states = (this.store.chainWalletState || [])
      .filter(cws => cws.walletName === this.walletName)
      .map(cws => cws.walletState);

    // If any chain is in the connected state, return connected
    if (states.includes(WalletState.Connected)) {
      return WalletState.Connected;
    }

    // 如果有任何一個鏈正在連接中，則返回連接中
    if (states.includes(WalletState.Connecting)) {
      return WalletState.Connecting;
    }

    // 如果所有鏈都是不存在狀態，則返回不存在
    if (states.length > 0 && states.every(state => state === WalletState.NotExist)) {
      return WalletState.NotExist;
    }

    // 如果有任何一個鏈是被拒絕狀態，則返回被拒絕
    if (states.includes(WalletState.Rejected)) {
      return WalletState.Rejected;
    }

    // 預設返回未連接
    return WalletState.Disconnected;
  }

  get errorMessage(): string {
    // 獲取此錢包在所有鏈上的錯誤訊息
    const errors = (this.store.chainWalletState || [])
      .filter(cws => cws.walletName === this.walletName)
      .map(cws => cws.errorMessage)
      .filter(error => error && error.trim() !== '');

    // 返回第一個非空錯誤訊息，如果沒有則返回空字串
    return errors.length > 0 ? errors[0] : '';
  }

  async init(): Promise<void> {

    try {
      await this.originalWallet.init()

      this.originalWallet.events.on('accountChanged', async () => {
        const chains = Array.from(this.originalWallet.chainMap.values())
        for (const chain of chains) {
          await this.getAccount(chain.chainId)
        }
      })

      this.originalWallet.events.on('disconnect', () => {
        // Update all chains for this wallet to disconnected state
        this.store.chains.forEach(chain => {
          this.store.updateChainWalletState(this.walletName, chain.chainName, {
            walletState: WalletState.Disconnected,
            account: null,
            errorMessage: ''
          });
        });
      });

      this.store.chains.forEach(chain => {
        const lastChainWalletState = this.store.getChainWalletState(this.walletName, chain.chainName)?.walletState
        if (lastChainWalletState === WalletState.NotExist) {
          this.store.updateChainWalletState(this.walletName, chain.chainName, {
            walletState: WalletState.Disconnected,
            errorMessage: ''
          });
        }
      });
    } catch (error) {
      if (error === clientNotExistError) {
        this.store.chains.forEach(chain => {
          this.store.updateChainWalletState(this.walletName, chain.chainName, {
            walletState: WalletState.NotExist,
            errorMessage: clientNotExistError.message
          });
        })
      }
    }
  }

  async connect(chainId: Chain["chainId"]): Promise<void> {

    const { store, walletName, originalWallet } = this

    const chainToConnect = this.getChainById(chainId)

    const state = store.getChainWalletState(walletName, chainToConnect.chainName)?.walletState
    if (state === WalletState.NotExist) {
      return
    }

    if (walletName === 'WalletConnect' && state === WalletState.Connected) {
      return
    }

    store.setCurrentChainName(chainToConnect.chainName)
    store.setCurrentWalletName(walletName)
    store.setWalletConnectQRCodeUri('')

    store.updateChainWalletState(walletName, chainToConnect.chainName, { walletState: WalletState.Connecting, errorMessage: '' })
    try {

      if (originalWallet instanceof WCWallet) {
        originalWallet.setOnPairingUriCreatedCallback((uri) => {
          store.setWalletConnectQRCodeUri(uri)
        })
      }

      await originalWallet.connect(chainToConnect.chainId)

      store.updateChainWalletState(walletName, chainToConnect.chainName, { walletState: WalletState.Connected })

      await this.getAccount(chainToConnect.chainId)
    } catch (error) {
      if ((error as any).message.includes('rejected')) {
        store.updateChainWalletState(walletName, chainToConnect.chainName, { walletState: WalletState.Rejected, errorMessage: (error as any).message })
        return
      } else {
        store.updateChainWalletState(walletName, chainToConnect.chainName, { walletState: WalletState.Disconnected, errorMessage: (error as any).message })
      }
    }
  }
  async disconnect(chainId: Chain["chainId"]) {
    const { store, walletName, originalWallet } = this

    const chainToConnect = this.getChainById(chainId)

    try {
      if (this.walletState === WalletState.Connected) {
        await originalWallet.disconnect(chainToConnect.chainId)
      }
      store.updateChainWalletState(walletName, chainToConnect.chainName, { walletState: WalletState.Disconnected, account: null })
    } catch (error) {

    }
  }
  async getAccount(chainId: Chain["chainId"]): Promise<WalletAccount> {
    const chainToConnect = this.getChainById(chainId)
    const { store, walletName, originalWallet } = this
    try {
      const account = await originalWallet.getAccount(chainToConnect.chainId)
      store.updateChainWalletState(walletName, chainToConnect.chainName, { account })
      if (this.originalWallet instanceof WCWallet) {
        this.originalWallet.setAccountToRestore(account)
      }
      return account
    } catch (error) {
      console.log(error)
    }
  }
  getOfflineSigner(chainId: Chain['chainId']): Promise<OfflineAminoSigner | OfflineDirectSigner> {
    return this.originalWallet.getOfflineSigner(chainId)
  }
  addSuggestChain(chainId: Chain["chainId"]): Promise<void> {
    return this.originalWallet.addSuggestChain(chainId)
  }
  getProvider(chainId?: Chain["chainId"]): Promise<any> {
    return this.originalWallet.getProvider(chainId)
  }
  getChainById(chainId: Chain["chainId"]): Chain {
    return this.originalWallet.getChainById(chainId)
  }
  getWalletOfType<T>(
    WalletClass: new (...args: any[]) => T
  ): T | undefined {
    if (this.originalWallet instanceof WalletClass) {
      return this.originalWallet as T
    }
    if (this.originalWallet instanceof MultiChainWallet) {
      if (isSameConstructor(WalletClass, CosmosWallet)) {
        const cosmosWallet = this.originalWallet.getWalletByChainType('cosmos')
        if (cosmosWallet) {
          return cosmosWallet as T
        }
      }
      if (isSameConstructor(WalletClass, EthereumWallet)) {
        const ethereumWallet = this.originalWallet.getWalletByChainType('eip155')
        if (ethereumWallet) {
          return ethereumWallet as T
        }
      }
    }
    return undefined
  }
}
