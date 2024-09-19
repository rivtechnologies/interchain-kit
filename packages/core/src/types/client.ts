import { InjSigningClient } from '@interchainjs/injective/signing-client';
import { CosmWasmSigningClient } from 'interchainjs/cosmwasm';
import { QueryImpl } from "@interchainjs/cosmos-types/service-ops"
import { SigningClient } from "interchainjs/signing-client";
import { CosmosClientType } from "./common";
import { CosmosSigningClient } from 'interchainjs/cosmos';

export type CreateClientReturnType = {
    queryClient: QueryImpl;
    signingClient: SigningClient
    cosmosSigningClient: CosmosSigningClient
    cosmWasmSigningClient: CosmWasmSigningClient
    injectiveSigningClient: InjSigningClient,
    getQueryClient: () => Promise<QueryImpl>
    getSigningClient: () => Promise<SigningClient>
    getSigningCosmosClient: () => Promise<CosmosSigningClient>
    getSigningCosmWasmClient: () => Promise<CosmWasmSigningClient>
    getSigningInjectiveClient: () => Promise<InjSigningClient>
}