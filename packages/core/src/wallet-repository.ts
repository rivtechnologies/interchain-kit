import { AssetList, Chain } from "@chain-registry/v2-types";
import { ChainAccount } from "./chain-account";
import { BaseWallet } from "./base-wallet";
import { WalletManager } from "./wallet-manager";
import { ICosmosGenericOfflineSigner, OfflineAminoSigner, OfflineDirectSigner, AminoSignResponse, StdSignature, DirectSignResponse } from "@interchainjs/cosmos/types/wallet";
import { StdSignDoc } from "@interchainjs/types";
import { WalletAccount, SimpleAccount, SignOptions, DirectSignDoc, BroadcastMode, WalletState, SignerOptions, EndpointOptions } from "./types";
import { CustomMap } from "./utils/helpers";

export class WalletRepository extends BaseWallet {
  wallet: BaseWallet
  chainNameMap: CustomMap<Chain['chainName'], Chain> = new CustomMap()
  chainIdMap: CustomMap<Chain['chainId'], Chain> = new CustomMap()
  chainAccountMap: CustomMap<Chain['chainId'], ChainAccount> = new CustomMap()
  walletManager: WalletManager
  currentChainName: string

  constructor(chains: Chain[], assetLists: AssetList[], wallet: BaseWallet, walletManager: WalletManager) {
    super()
    this.wallet = wallet
    this.walletManager = walletManager
    this.info = wallet.info

    chains.forEach((chain) => {
      this.chainNameMap.set(chain.chainName, chain)
      this.chainIdMap.set(chain.chainId, chain)
      const assetList = assetLists.find((assetList) => assetList.chainName === chain.chainName)
      this.chainAccountMap.set(chain.chainId, new ChainAccount(chain, assetList, this, walletManager))
    })

    this.wallet.events.on('accountChanged', () => {
      this.chainAccountMap.forEach(async (chainAccount) => {
        chainAccount.reset()
      })
    })
  }

  addChains(chain: Chain, assetList: AssetList, signerOptions?: SignerOptions, endpointOptions?: EndpointOptions) {
    this.chainNameMap.set(chain.chainName, chain)
    this.chainIdMap.set(chain.chainId, chain)

    const newChainAccount = new ChainAccount(chain, assetList, this, this.walletManager)
    newChainAccount.signerOptions = signerOptions?.signing?.(chain.chainName)
    newChainAccount.rpcEndpoint = endpointOptions?.endpoints[chain.chainName].rpc?.[0]

    this.chainAccountMap.set(chain.chainId, newChainAccount)
  }

  getWalletInfo() {
    return this.wallet.info
  }

  isAllChainAccountDisconnected() {
    return Array.from(this.chainAccountMap.values()).every((chainAccount) => chainAccount.walletState === WalletState.Disconnected)
  }

  isSomeChainAccountConnected() {
    return Array.from(this.chainAccountMap.values()).some((chainAccount) => chainAccount.walletState === WalletState.Connected)
  }

  getChainAccountByName(chainName: Chain['chainName']): ChainAccount | undefined {
    const chain = this.chainNameMap.get(chainName)
    if (!chain) return undefined
    return this.chainAccountMap.get(chain.chainId)
  }
  getChainAccountById(chainId: Chain['chainId']): ChainAccount | undefined {
    return this.chainAccountMap.get(chainId)
  }
  async init(meta?: unknown): Promise<void> {
    return this.wallet.init(meta)
  }
  async connect(chainId: string | string[]): Promise<void> {
    const _chainIds = Array.isArray(chainId) ? chainId : [chainId]
    await Promise.all(_chainIds.map((chainId) => this.getChainAccountById(chainId).connect()))
    return Promise.resolve()
  }
  async disconnect(chainId: string | string[]): Promise<void> {
    const _chainIds = Array.isArray(chainId) ? chainId : [chainId]
    await Promise.all(_chainIds.map((chainId) => this.getChainAccountById(chainId).disconnect()))
    return Promise.resolve()
  }
  async disconnectAll(): Promise<void> {
    await Promise.all(Array.from(this.chainAccountMap.values()).map((chainAccount) => chainAccount.disconnect()))
    return Promise.resolve()
  }
  getAccount(chainId: string): Promise<WalletAccount> {
    return this.getChainAccountById(chainId).getAccount()
  }
  getAccounts(chainIds: string[]): Promise<WalletAccount[]> {
    return Promise.all(chainIds.map((chainId) => this.getAccount(chainId)))
  }
  getSimpleAccount(chainId: string): Promise<SimpleAccount> {
    throw new Error("Method not implemented.");
  }
  getOfflineSigner(chainId: string): ICosmosGenericOfflineSigner {
    return this.getChainAccountById(chainId).getOfflineSigner()
  }
  getOfflineSignerAmino(chainId: string): OfflineAminoSigner {
    return this.getChainAccountById(chainId).getOfflineSignerAmino(chainId) as unknown as OfflineAminoSigner
  }
  getOfflineSignerDirect(chainId: string): OfflineDirectSigner {
    return this.getChainAccountById(chainId).getOfflineSignerDirect(chainId) as unknown as OfflineDirectSigner
  }
  signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<AminoSignResponse> {
    return this.wallet.signAmino(chainId, signer, signDoc, signOptions)
  }
  signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature> {
    return this.wallet.signArbitrary(chainId, signer, data)
  }
  verifyArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<boolean> {
    return this.wallet.verifyArbitrary(chainId, signer, data)
  }
  signDirect(chainId: string, signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions): Promise<DirectSignResponse> {
    return this.wallet.signDirect(chainId, signer, signDoc, signOptions)
  }
  sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array> {
    return this.wallet.sendTx(chainId, tx, mode)
  }
  addSuggestChain(chain: Chain, assetLists: AssetList[]): Promise<void> {
    return this.getChainAccountById(chain.chainId).addSuggestChain(chain, assetLists)
  }

}