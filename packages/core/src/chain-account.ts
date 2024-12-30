import { HttpEndpoint, StdSignDoc } from '@interchainjs/types';
import { WalletManager } from './wallet-manager';
import { AssetList, Chain } from "@chain-registry/v2-types";
import { BaseWallet } from "./base-wallet";
import { AminoGenericOfflineSigner, AminoSignResponse, DirectGenericOfflineSigner, DirectSignResponse, ICosmosGenericOfflineSigner, OfflineAminoSigner, OfflineDirectSigner, OfflineSigner, StdSignature } from '@interchainjs/cosmos/types/wallet';
import { SigningClient } from '@interchainjs/cosmos/signing-client';
import { AsyncHandler, getValidRpcEndpoint, NoValidRpcEndpointFound, removeWalletNameFromLocalStorage, setWalletNameToLocalStorage } from './utils';
import { BroadcastMode, DirectSignDoc, SignOptions, SimpleAccount, WalletAccount, WalletState } from './types';
import { WalletRepository } from './wallet-repository';
import { SignerOptions as InterchainSignerOptions } from '@interchainjs/cosmos/types/signing-client';


export class ChainAccount extends BaseWallet {
  chain: Chain
  assetList: AssetList
  wallet: BaseWallet

  walletRepo: WalletRepository
  walletManager: WalletManager

  signerOptions: InterchainSignerOptions

  private _account: AsyncHandler<WalletAccount> = new AsyncHandler<WalletAccount>()
  private _offlineSigner: AsyncHandler<OfflineSigner> = new AsyncHandler<OfflineSigner>()
  private _rpcEndpoint: AsyncHandler<string | HttpEndpoint> = new AsyncHandler<string | HttpEndpoint>()
  private _signingClient: AsyncHandler<SigningClient> = new AsyncHandler<SigningClient>()
  private _offlineSignerAmino: AsyncHandler<OfflineAminoSigner> = new AsyncHandler<OfflineAminoSigner>()
  private _offlineSignerDirect: AsyncHandler<OfflineDirectSigner> = new AsyncHandler<OfflineDirectSigner>()

  constructor(chain: Chain, assetList: AssetList, walletRepo: WalletRepository, walletManager: WalletManager) {
    super()
    this.chain = chain
    this.assetList = assetList
    this.walletRepo = walletRepo
    this.wallet = this.walletRepo.wallet
    this.walletManager = walletManager
  }

  get account() {
    return this._account.data
  }
  set account(account: WalletAccount) {
    this._account.data = account
  }
  getAccountState = () => this._account

  get offlineSigner() {
    return this._offlineSigner.data
  }
  set offlineSigner(offlineSigner: OfflineSigner) {
    this._offlineSigner.data = offlineSigner
  }
  getOfflineSignerState = () => this._offlineSigner

  get signingClient() {
    return this._signingClient.data
  }
  set signingClient(signingClient: SigningClient) {
    this._signingClient.data = signingClient
  }
  getSigningClientState = () => this._signingClient

  get rpcEndpoint() {
    return this._rpcEndpoint.data
  }
  set rpcEndpoint(rpcEndpint: string | HttpEndpoint) {
    this._rpcEndpoint.data = rpcEndpint
  }
  getRpcEndpointState = () => this._rpcEndpoint

  reset() {
    this._account.data = null
    this._offlineSigner.data = null
    this._offlineSignerAmino.data = null
    this._offlineSignerDirect.data = null
    this._signingClient.data = null
  }

  setErrorMessage(message: string) {
    this.errorMessage = message
    this.wallet.errorMessage = message
    this.walletRepo.errorMessage = message
  }

  async connect() {
    try {
      await this.wallet.connect(this.chain.chainId)
      this.walletManager.currentWalletName = this.wallet.info.name

      this.walletState = WalletState.Connected
      if (this.walletRepo.isSomeChainAccountConnected()) {
        this.wallet.walletState = WalletState.Connected
        this.walletRepo.walletState = WalletState.Connected
      }

      this.errorMessage = ''
      this.wallet.errorMessage = ''
      this.walletRepo.errorMessage = ''

      this.walletManager.currentWalletName = this.wallet.info.name

      this.walletRepo.currentChainName = this.chain.chainName
      setWalletNameToLocalStorage(this.wallet.info.name)
    } catch (error) {
      console.log(error)
      this.errorMessage = (error as any).message
      this.wallet.errorMessage = (error as any).message
      this.walletRepo.errorMessage = (error as any).message
    }
  }

  async disconnect() {
    try {
      await this.wallet.disconnect(this.chain.chainId)
      this.walletState = WalletState.Disconnected
      if (this.walletRepo.isAllChainAccountDisconnected()) {
        this.wallet.walletState = WalletState.Disconnected
        this.walletRepo.walletState = WalletState.Disconnected
        removeWalletNameFromLocalStorage()
      }
      this.reset()
    } catch (error) {
      console.log(error)
      this.setErrorMessage((error as any).message)
    }
  }

  async getAccount() {
    if (this.walletState === WalletState.Disconnected) {
      return
    }
    return this._account.doAsync(() => this.wallet.getAccount(this.chain.chainId))
  }

  getPreferredSignType() {
    return this.walletManager.signerOptions?.preferredSignType?.(this.chain.chainName) || 'amino'
  }

  getOfflineSigner(): ICosmosGenericOfflineSigner {
    if (this.walletState === WalletState.Disconnected) {
      return
    }
    if (this._offlineSigner.data) {
      return this._offlineSigner.data as unknown as ICosmosGenericOfflineSigner
    } else {
      const preferredSignType = this.getPreferredSignType()

      if (preferredSignType === 'amino') {
        this._offlineSigner.data = new AminoGenericOfflineSigner(this.wallet.getOfflineSignerAmino(this.chain.chainId))
      }
      if (preferredSignType === 'direct') {
        this._offlineSigner.data = new DirectGenericOfflineSigner(this.wallet.getOfflineSignerDirect(this.chain.chainId))
      }
      return this._offlineSigner.data as unknown as ICosmosGenericOfflineSigner
    }
  }

  async getRpcEndpoint() {
    return this._rpcEndpoint.doAsync(async () => {
      let rpcEndpoint: string | HttpEndpoint = ''
      const providerRpcEndpoints = this.walletManager.endpointOptions.endpoints[this.chain.chainName]?.rpc || []
      // const walletRpcEndpoints = wallet?.info?.endpoints?.[chain.chainName]?.rpc || []
      const chainRpcEndpoints = this.chain.apis.rpc.map(url => url.address)

      if (providerRpcEndpoints?.[0]) {
        rpcEndpoint = providerRpcEndpoints[0]
        return rpcEndpoint
      }

      const validRpcEndpoint = await getValidRpcEndpoint([...providerRpcEndpoints, ...chainRpcEndpoints])

      if (validRpcEndpoint === '') {
        throw new NoValidRpcEndpointFound()
      }

      rpcEndpoint = validRpcEndpoint
      return rpcEndpoint
    })
  }

  getSignerOptions() {
    if (this.signerOptions) {
      return this.signerOptions
    }
    this.signerOptions = this.walletManager.getSignerOptions(this.chain.chainName)
    const options: InterchainSignerOptions = {
      prefix: this.chain.bech32Prefix,
      broadcast: {
        checkTx: true,
        deliverTx: false,
      },
      ...this.signerOptions,
    }
    return options
  }

  async getSigningClient() {
    if (this.walletState === WalletState.Disconnected) {
      return
    }
    return this._signingClient.doAsync(async () => {
      let signingClient: SigningClient
      const rpcEndpoint = await this.getRpcEndpoint()
      const offlineSigner = await this.getOfflineSigner()
      const signerOptions = await this.getSignerOptions()
      signingClient = await SigningClient.connectWithSigner(rpcEndpoint, offlineSigner, signerOptions)
      return signingClient
    })
  }
  init(meta?: unknown): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getAccounts(chainIds: string[]): Promise<WalletAccount[]> {
    throw new Error('Method not implemented.');
  }
  getSimpleAccount(chainId: string): Promise<SimpleAccount> {
    throw new Error('Method not implemented.');
  }
  getOfflineSignerAmino(chainId: string): OfflineAminoSigner {
    if (this._offlineSignerAmino.data) {
      return this._offlineSignerAmino.data
    } else {
      this._offlineSignerAmino.data = this.wallet.getOfflineSignerAmino(chainId)
    }
  }
  getOfflineSignerDirect(chainId: string): OfflineDirectSigner {
    if (this._offlineSignerDirect.data) {
      return this._offlineSignerDirect.data
    } else {
      this._offlineSignerDirect.data = this.wallet.getOfflineSignerDirect(chainId)
    }
  }
  signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<AminoSignResponse> {
    throw new Error('Method not implemented.');
  }
  signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature> {
    throw new Error('Method not implemented.');
  }
  verifyArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  signDirect(chainId: string, signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions): Promise<DirectSignResponse> {
    throw new Error('Method not implemented.');
  }
  sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }
  addSuggestChain(chain: Chain, assetLists: AssetList[]): Promise<void> {
    return this.wallet.addSuggestChain(chain, assetLists)
  }


}