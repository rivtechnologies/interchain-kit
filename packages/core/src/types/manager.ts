import { Chain } from '@chain-registry/types';
import { HttpEndpoint } from '@interchainjs/types';

import { ChainName } from './chain';
import { SignType } from './common';

export interface SignerOptions {
  signing?: (chain: Chain | ChainName) => any | undefined;
  preferredSignType?: (chain: Chain | ChainName) => SignType | undefined; // using `amino` if undefined
}

export interface Endpoints {
  rpc?: (string | HttpEndpoint)[];
  rest?: (string | HttpEndpoint)[];
}

export interface EndpointOptions {
  endpoints?: Record<ChainName, Endpoints>;
}

export enum WalletManagerState {
  Initializing = 'Initializing',
  Initialized = 'Initialized',
}