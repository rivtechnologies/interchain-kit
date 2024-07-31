import { AssetList, Chain } from "@chain-registry/v2-types";
import { ChainName } from './chain'
import { HttpEndpoint, SigningStargateClientOptions, StargateClientOptions } from "@cosmjs/stargate";
import { CosmWasmClient, SigningCosmWasmClientOptions } from "@cosmjs/cosmwasm-stargate";
import { SignType } from "./common";
import { BaseWallet } from "../base-wallet";

export interface SignerOptions {
  stargate?: (chain: Chain | ChainName) => StargateClientOptions | undefined;
  signingStargate?: (chain: Chain | ChainName) => SigningStargateClientOptions | undefined;
  signingCosmwasm?: (chain: Chain | ChainName) => SigningCosmWasmClientOptions | undefined;
  preferredSignType?: (chain: Chain | ChainName) => SignType | undefined; // using `amino` if undefined
}

export interface Endpoints {
  rpc?: (string | HttpEndpoint)[];
  rest?: (string | HttpEndpoint)[];
}

export interface EndpointOptions {
  endpoints?: Record<ChainName, Endpoints>;
}

export interface Config {
  wallets: BaseWallet[];
  chains: Chain[];
  assetLists: AssetList[];
  signerOptions: SignerOptions;
  endpointOptions: EndpointOptions
}