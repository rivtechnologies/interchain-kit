export abstract class BaseSigner<
  StargateClientType,
  CosmwasmClientType,
  SigningStargateClientType,
  SigningCosmwasmClientType,
  ClientType,
  SigningClientType
> {
  abstract getStargateClient(): Promise<StargateClientType>
  abstract getCosmwasmClient(): Promise<CosmwasmClientType>
  abstract getSigningStargateClient(): Promise<SigningStargateClientType>
  abstract getSigningCosmwasmClient(): Promise<SigningCosmwasmClientType>
  abstract getClient(): Promise<ClientType>
  abstract getSigningClient(): Promise<SigningClientType>
}