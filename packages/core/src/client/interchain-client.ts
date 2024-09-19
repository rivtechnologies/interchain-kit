import { CosmosSigningClient } from 'interchainjs/cosmos'
import { CosmWasmSigningClient } from 'interchainjs/cosmwasm'
import { OfflineSigner } from '@interchainjs/cosmos/types/wallet';
import { SignerOptions } from "interchainjs/types/";
import { HttpEndpoint } from '@interchainjs/types';
import { SigningClient } from 'interchainjs/signing-client';
import { RpcQuery } from 'interchainjs/query/rpc';
import { QueryImpl } from '@interchainjs/cosmos-types/service-ops';
import { CreateClientReturnType, SignType } from '../types';
import { InjSigningClient } from '@interchainjs/injective/signing-client';

export class InterchainJsSigner {
  rpcEndpoint: string | HttpEndpoint
  offlineSigner: OfflineSigner
  signerOptions: SignerOptions
  preferredSignType: SignType

  constructor(
    rpcEndpoint: string | HttpEndpoint,
    offlineSigner: OfflineSigner,
    signerOptions: SignerOptions,
    preferredSignType: SignType
  ) {
    this.rpcEndpoint = rpcEndpoint
    this.offlineSigner = offlineSigner
    this.signerOptions = signerOptions
    this.preferredSignType = preferredSignType
  }

  //query
  getStargateClient(): Promise<undefined> {
    console.log('Method not implemented. Use interchain query instead');
    return undefined
  }
  getCosmwasmClient(): Promise<undefined> {
    console.log('Method not implemented. Use interchain query instead');
    return undefined
  }
  async getQueryClient(): Promise<QueryImpl> {
    return new RpcQuery(this.rpcEndpoint)
  }

  //signing
  async getSigningCosmosClient(prefix?: string): Promise<CosmosSigningClient> {
    const options: SignerOptions = {
      ...this.signerOptions,
      preferredSignType: this.preferredSignType,
      prefix: prefix,
      broadcast: {
        checkTx: true,
        deliverTx: false,
        // useLegacyBroadcastTxCommit: true,
      },
    }
    return CosmosSigningClient.connectWithSigner(this.rpcEndpoint, this.offlineSigner, options)
  }

  async getSigningCosmWasmClient(prefix?: string): Promise<CosmWasmSigningClient> {
    const options: SignerOptions = {
      ...this.signerOptions,
      preferredSignType: this.preferredSignType,
      prefix: prefix,
      broadcast: {
        checkTx: true,
        deliverTx: false,
        // useLegacyBroadcastTxCommit: true,
      },
    }
    return CosmWasmSigningClient.connectWithSigner(this.rpcEndpoint, this.offlineSigner, options)
  }

  async getSigningInjectiveClient(prefix?: string): Promise<InjSigningClient> {
    const options: SignerOptions = {
      ...this.signerOptions,
      preferredSignType: this.preferredSignType,
      prefix: prefix,
      broadcast: {
        checkTx: true,
        deliverTx: false,
      },
    }
    return InjSigningClient.connectWithSigner(this.rpcEndpoint, this.offlineSigner, options)
  }

  async getSigningClient(): Promise<SigningClient> {
    return SigningClient.connectWithSigner(this.rpcEndpoint, this.offlineSigner, this.signerOptions)
  }

  static async connect(
    rpcEndpoint: string | HttpEndpoint,
    offlineSigner: OfflineSigner,
    signerOptions: SignerOptions,
    preferredSignType: SignType
  ): Promise<CreateClientReturnType> {

    const interchainJsSigner = new InterchainJsSigner(
      rpcEndpoint,
      offlineSigner,
      signerOptions,
      preferredSignType
    )

    return {
      queryClient: await interchainJsSigner.getQueryClient(),
      signingClient: await interchainJsSigner.getSigningClient(),
      cosmosSigningClient: await interchainJsSigner.getSigningCosmosClient(),
      cosmWasmSigningClient: await interchainJsSigner.getSigningCosmWasmClient(),
      injectiveSigningClient: await interchainJsSigner.getSigningInjectiveClient(),
      getQueryClient: interchainJsSigner.getQueryClient,
      getSigningClient: interchainJsSigner.getSigningClient,
      getSigningCosmosClient: interchainJsSigner.getSigningCosmosClient,
      getSigningCosmWasmClient: interchainJsSigner.getSigningCosmWasmClient,
      getSigningInjectiveClient: interchainJsSigner.getSigningInjectiveClient
    }
  }
}