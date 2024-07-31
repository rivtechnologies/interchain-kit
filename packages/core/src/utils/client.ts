import { Chain } from '@chain-registry/v2-types';
import { Config, CosmosClientType } from '../types';
import { BaseWallet } from '../base-wallet';
import { calculateFee, GasPrice, HttpEndpoint, SigningStargateClient, StargateClient } from '@cosmjs/stargate';
import { chains } from '@chain-registry/v2';
import { CosmWasmClient, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { EncodeObject } from '@cosmjs/proto-signing';
import { NoGasPriceFound } from './errors';
import { StdFee } from '@cosmjs/amino';
import type { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { getValidRestEndpoint, getValidRpcEndpoint, isValidRestEndpoint, isValidRpcEndpoint } from './endpoint';

export class CosmosKitClient {
  config: Config
  wallet: BaseWallet
  chain: Chain
  _rpcEndpoint: string | HttpEndpoint | null
  _restEndpoint: string | HttpEndpoint | null
  constructor(config: Config, wallet: BaseWallet, chainName: string) {
    this.config = config
    this.wallet = wallet
    this.chain = chains.find(chain => chain.chainName === chainName)
    this._rpcEndpoint = null
    this._restEndpoint = null
  }

  getRestEndpoint = async () => {
    if (this._restEndpoint) {
      return this._restEndpoint
    }

    const providerRestEndpoints = this.config.endpointOptions?.endpoints?.[this.chain.chainName].rest || []
    const walletRestEndpoints = this.wallet?.option?.endpoints?.[this.chain.chainName].rest || []
    const chainRestEndpoints = this.chain.apis.rest.map(url => url.address)

    if (providerRestEndpoints[0] && await isValidRestEndpoint(providerRestEndpoints[0])) {
      this._restEndpoint = providerRestEndpoints[0]
      return providerRestEndpoints[0]
    }

    if (walletRestEndpoints[0] && await isValidRestEndpoint(walletRestEndpoints[0])) {
      this._restEndpoint = walletRestEndpoints[0]
      return walletRestEndpoints[0]
    }

    if (chainRestEndpoints[0] && await isValidRestEndpoint(chainRestEndpoints[0])) {
      this._restEndpoint = chainRestEndpoints[0]
      return chainRestEndpoints[0]
    }

    this._restEndpoint = await getValidRestEndpoint([...providerRestEndpoints, ...walletRestEndpoints, ...chainRestEndpoints])
    return this._restEndpoint
  }

  getRpcEndpoint = async () => {
    if (this._rpcEndpoint) {
      return this._rpcEndpoint
    }

    const providerRpcEndpoints = this.config.endpointOptions?.endpoints?.[this.chain.chainName]?.rpc || []
    const walletRpcEndpoints = this.wallet?.option?.endpoints?.[this.chain.chainName]?.rpc || []
    const chainRpcEndpoints = this.chain.apis.rpc.map(url => url.address)

    if (providerRpcEndpoints?.[0] && await isValidRpcEndpoint(providerRpcEndpoints[0])) {
      this._rpcEndpoint = providerRpcEndpoints[0]
      return providerRpcEndpoints[0]
    }

    if (walletRpcEndpoints?.[0] && await isValidRpcEndpoint(providerRpcEndpoints[0])) {
      this._rpcEndpoint = walletRpcEndpoints[0]
      return walletRpcEndpoints[0]
    }

    if (chainRpcEndpoints[0] && await isValidRpcEndpoint(chainRpcEndpoints[0])) {
      this._rpcEndpoint = chainRpcEndpoints[0]
      return chainRpcEndpoints[0]
    }

    this._rpcEndpoint = await getValidRpcEndpoint([...providerRpcEndpoints, ...walletRpcEndpoints, ...chainRpcEndpoints])
    return this._rpcEndpoint
  }

  getOfflineSigner = () => {
    switch (this.config.signerOptions.preferredSignType(this.chain.chainId)) {
      case 'amino':
        return this.wallet.getOfflineSignerAmino(this.chain.chainId);
      case 'direct':
        return this.wallet.getOfflineSignerDirect(this.chain.chainId);
      default:
        return this.wallet.getOfflineSignerAmino(this.chain.chainId);
    }
  }

  getStargateClient = async () => {
    const rpcEndpoint = await this.getRpcEndpoint()
    return StargateClient.connect(rpcEndpoint)
  }

  getCosmWasmClient = async () => {
    const rpcEndpoint = await this.getRpcEndpoint()
    return CosmWasmClient.connect(rpcEndpoint)
  }

  getSigningStargateClient = async () => {
    const rpcEndpoint = await this.getRpcEndpoint()
    const offlineSigner = this.getOfflineSigner()
    return SigningStargateClient.connectWithSigner(
      rpcEndpoint,
      offlineSigner,
      this.config.signerOptions.signingStargate(this.chain.chainId)
    )
  }

  getSigningCosmWasmClient = async () => {
    const rpcEndpoint = await this.getRpcEndpoint()
    const offlineSigner = this.getOfflineSigner()
    return SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      offlineSigner,
      this.config.signerOptions.signingCosmwasm(this.chain.chainId)
    )
  }

  getSigningClient = async (type?: CosmosClientType) => {
    switch (type) {
      case 'stargate':
        return await this.getSigningStargateClient();
      case 'cosmwasm':
        return await this.getSigningCosmWasmClient();
      default:
        return this.getSigningStargateClient();
    }
  }

  estimateFee = async (
    messages: EncodeObject[],
    type?: CosmosClientType,
    memo?: string,
    multiplier?: number
  ) => {

    const account = await this.wallet.getAccount(this.chain.chainId)

    let gasPrice: GasPrice | undefined;
    switch (type) {
      case 'stargate':
        gasPrice = this.config.signerOptions?.signingStargate(this.chain.chainId)?.gasPrice
        break;
      case 'cosmwasm':
        gasPrice = this.config.signerOptions?.signingCosmwasm(this.chain.chainId)?.gasPrice;
        break;
      default:
        gasPrice = this.config.signerOptions?.signingStargate(this.chain.chainId)?.gasPrice;
        break;
    }

    if (!gasPrice) {
      throw new NoGasPriceFound()
    }
    const client = await this.getSigningClient(type);
    const gasEstimation = await client.simulate(account.address, messages, memo);

    return calculateFee(
      Math.round(gasEstimation * (multiplier || 1.4)),
      gasPrice
    );
  }

  sign = async (
    messages: EncodeObject[],
    fee?: StdFee | number,
    memo?: string,
    type?: CosmosClientType
  ): Promise<TxRaw> => {
    const client = await this.getSigningClient(type);
    let usedFee: StdFee;
    if (typeof fee === 'undefined' || typeof fee === 'number') {
      usedFee = await this.estimateFee(messages, type, memo, fee);
    } else {
      usedFee = fee;
    }

    const account = await this.wallet.getAccount(this.chain.chainId)

    return await client.sign(account.address, messages, usedFee, memo || '');
  };

  broadcast = async (signedMessages: TxRaw, type?: CosmosClientType) => {
    const client = await this.getSigningClient(type);
    const { TxRaw } = await import('cosmjs-types/cosmos/tx/v1beta1/tx');
    const txBytes = TxRaw.encode(signedMessages).finish();

    let timeoutMs: number | undefined, pollIntervalMs: number | undefined;
    switch (type) {
      case 'stargate':
        timeoutMs = this.config.signerOptions.signingStargate(this.chain.chainId)?.broadcastTimeoutMs;
        pollIntervalMs = this.config.signerOptions.signingStargate(this.chain.chainId)?.broadcastPollIntervalMs;
        break;
      case 'cosmwasm':
        timeoutMs = this.config.signerOptions.signingCosmwasm(this.chain.chainId)?.broadcastTimeoutMs;
        pollIntervalMs = this.config.signerOptions.signingCosmwasm(this.chain.chainId)?.broadcastPollIntervalMs;
        break;
      default:
        timeoutMs = this.config.signerOptions.signingStargate(this.chain.chainId)?.broadcastTimeoutMs;
        pollIntervalMs = this.config.signerOptions.signingStargate(this.chain.chainId)?.broadcastPollIntervalMs;
        break;
    }

    return client.broadcastTx(txBytes, timeoutMs, pollIntervalMs);
  };

  signAndBroadcast = async (
    messages: EncodeObject[],
    fee?: StdFee | number,
    memo?: string,
    type?: CosmosClientType
  ) => {
    const signedMessages = await this.sign(messages, fee, memo, type);
    return this.broadcast(signedMessages, type);
  };
}