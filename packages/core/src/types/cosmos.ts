import { AminoSignResponse, CosmosSignerConfig, DirectSignResponse } from "@interchainjs/cosmos";
import { StdSignDoc } from "@interchainjs/types";
import { WalletAccount, DirectSignDoc } from "./wallet";

export interface OfflineAminoSigner {
  getAccounts: () => Promise<readonly WalletAccount[]>;
  signAmino: (signer: string, signDoc: StdSignDoc) => Promise<AminoSignResponse>;
}

export interface OfflineDirectSigner {
  getAccounts: () => Promise<readonly WalletAccount[]>;
  signDirect: (signer: string, signDoc: DirectSignDoc) => Promise<DirectSignResponse>;
}

export interface CosmosSigningOptions {
  cosmosSignerConfig: CosmosSignerConfig
}