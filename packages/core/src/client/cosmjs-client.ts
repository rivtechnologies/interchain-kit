import { OfflineSigner } from '@cosmjs/proto-signing';
import { CosmWasmClient, SigningCosmWasmClient, SigningCosmWasmClientOptions } from "@cosmjs/cosmwasm-stargate";
import { HttpEndpoint, SigningStargateClient, SigningStargateClientOptions, StargateClient, StargateClientOptions } from "@cosmjs/stargate";
import { BaseSigner } from './base-client';

type Client = StargateClient | CosmWasmClient
type SignClient = SigningStargateClient | SigningCosmWasmClient

export class CosmJsSigner extends BaseSigner<
  StargateClient,
  CosmWasmClient,
  SigningStargateClient,
  SigningCosmWasmClient,
  Client,
  SignClient
> {

  rpcEndpoint: string | HttpEndpoint
  offlineSigner: OfflineSigner

  signingCosmwasmOptions: SigningCosmWasmClientOptions
  signingStargateOptions: SigningStargateClientOptions
  stargateOptions: StargateClientOptions

  constructor(
    rpcEndpoint: string | HttpEndpoint,
    offlineSigner: OfflineSigner,
    signingCosmwasmOptions: SigningCosmWasmClientOptions,
    signingStargateOptions: SigningStargateClientOptions,
    stargateOptions: StargateClientOptions
  ) {
    super()
    this.rpcEndpoint = rpcEndpoint
    this.offlineSigner = offlineSigner
    this.signingCosmwasmOptions = signingCosmwasmOptions
    this.signingStargateOptions = signingStargateOptions
    this.stargateOptions = stargateOptions
  }

  getStargateClient(): Promise<StargateClient> {
    return StargateClient.connect(this.rpcEndpoint, this.stargateOptions)
  }
  getCosmwasmClient(): Promise<CosmWasmClient> {
    return CosmWasmClient.connect(this.rpcEndpoint)
  }
  getSigningStargateClient(): Promise<SigningStargateClient> {
    return SigningStargateClient.connectWithSigner(this.rpcEndpoint, this.offlineSigner, this.signingStargateOptions)
  }
  getSigningCosmwasmClient(): Promise<SigningCosmWasmClient> {
    return SigningCosmWasmClient.connectWithSigner(this.rpcEndpoint, this.offlineSigner, this.signingCosmwasmOptions)
  }
  getClient(): Promise<Client> {
    return SigningStargateClient.connectWithSigner(this.rpcEndpoint, this.offlineSigner, this.signingStargateOptions)
  }
  getSigningClient(): Promise<SignClient> {
    return SigningStargateClient.connectWithSigner(this.rpcEndpoint, this.offlineSigner, this.signingStargateOptions)
  }

}