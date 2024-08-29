import { BaseSigner } from './base-client';
import { StargateSigningClient } from 'interchainjs/stargate'
import { CosmWasmSigningClient } from 'interchainjs/cosmwasm-stargate'
import { OfflineSigner } from '@interchainjs/cosmos/types/wallet';
import { SignerOptions } from "interchainjs/types/";
import { HttpEndpoint } from '@interchainjs/types';
import { SigningClient } from 'interchainjs/signing-client';
import { RpcQuery } from 'interchainjs/query/rpc';
import { QueryImpl } from '@interchainjs/cosmos-types/service-ops';

export class InterchainJsSigner extends BaseSigner<
  undefined,
  undefined,
  StargateSigningClient,
  CosmWasmSigningClient,
  QueryImpl,
  SigningClient
> {
  rpcEndpoint: string | HttpEndpoint
  offlineSigner: OfflineSigner
  signerOptions: SignerOptions
  constructor(
    rpcEndpoint: string | HttpEndpoint,
    offlineSigner: OfflineSigner,
    signerOptions: SignerOptions,
  ) {
    super()
    this.rpcEndpoint = rpcEndpoint
    this.offlineSigner = offlineSigner
    this.signerOptions = signerOptions
  }

  getStargateClient(): Promise<undefined> {
    console.log('Method not implemented. Use interchain query instead');
    return undefined
  }
  getCosmwasmClient(): Promise<undefined> {
    console.log('Method not implemented. Use interchain query instead');
    return undefined
  }
  async getSigningStargateClient(prefix?: string): Promise<StargateSigningClient> {
    const options = {
      ...this.signerOptions,
      prefix: prefix,
      broadcast: {
        checkTx: true,
        deliverTx: false,
        // useLegacyBroadcastTxCommit: true,
      },
    }
    return StargateSigningClient.connectWithSigner(this.rpcEndpoint, this.offlineSigner, options)
  }
  async getSigningCosmwasmClient(): Promise<CosmWasmSigningClient> {
    return CosmWasmSigningClient.connectWithSigner(this.rpcEndpoint, this.offlineSigner, this.signerOptions)
  }
  async getClient(): Promise<QueryImpl> {
    return new RpcQuery(this.rpcEndpoint)
  }
  async getSigningClient(): Promise<SigningClient> {
    return SigningClient.connectWithSigner(this.rpcEndpoint, this.offlineSigner, this.signerOptions)
  }
}