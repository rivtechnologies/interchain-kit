import { AssetList, Chain } from "@chain-registry/v2-types";
import { SignType, Wallet, WalletAccount, WalletEvents, WalletState } from "../types";
import EventEmitter from "events";
import { IGenericOfflineSigner } from "@interchainjs/types";


export abstract class BaseWallet {
  info: Wallet
  errorMessage: string
  walletState: WalletState
  events: EventEmitter<WalletEvents> = new EventEmitter()
  chainMap: Map<Chain['chainId'], Chain>
  assetLists: AssetList[] = []
  client: any
  constructor(info: Wallet) {
    this.info = info
  }
  setChainMap(chains: Chain[]) {
    this.chainMap = new Map(chains.map(chain => [chain.chainId, chain]))
  }
  addChain(chain: Chain) {
    this.chainMap.set(chain.chainId, chain)
  }
  setAssetLists(assetLists: AssetList[]) {
    this.assetLists = assetLists
  }
  getChainById(chainId: Chain['chainId']): Chain {
    const chain = this.chainMap.get(chainId);
    if (!chain) {
      throw new Error(`Chain ${chainId} not found in wallet ${this.info.name}`)
    }
    return chain
  }
  abstract init(): Promise<void>
  abstract connect(chainId: Chain['chainId']): Promise<void>
  abstract disconnect(chainId: Chain['chainId']): Promise<void>
  abstract getAccount(chainId: Chain['chainId']): Promise<WalletAccount>

  abstract getOfflineSigner(chainId: Chain['chainId']): Promise<IGenericOfflineSigner>
  abstract getOfflineSigner(chainId: Chain['chainId'], preferredSignType: SignType): Promise<IGenericOfflineSigner>

  abstract addSuggestChain(chainId: Chain['chainId']): Promise<void>
  abstract getProvider(chainId: Chain['chainId']): unknown
}