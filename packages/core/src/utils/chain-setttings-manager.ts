import { EndpointOptions, Endpoints, SignerOptions } from './../types/manager';
import { Chain } from "@chain-registry/v2-types";
import { SignType } from "../types";
import { SignerOptions as InterchainSignerOptions } from '@interchainjs/cosmos/types/signing-client';

export class ChainSettingsManager {
  preferredSignTypeMap: Record<Chain['chainName'], SignType> = {}
  signerOptionMap: Record<Chain['chainName'], InterchainSignerOptions> = {}
  preferredEndpointMap: Record<Chain['chainName'], Endpoints> = {}

  chainNameMap: Record<Chain['chainName'], Chain> = {}

  setSettings(chains: Chain[], signerOptions: SignerOptions, endpointOption: EndpointOptions) {
    chains.forEach(chain => {
      this.chainNameMap[chain.chainName] = chain
      this.setSignerOptions(chain.chainName, signerOptions)
      this.setPreferredSignType(chain.chainName, signerOptions)
      this.setPreferredEndpoint(chain.chainName, endpointOption)
    })
  }

  setSignerOptions(chainName: Chain['chainName'], options: SignerOptions) {
    this.signerOptionMap[chainName] = options?.signing?.(this.chainNameMap[chainName]) || {}
  }

  getSignerOptions(chainName: Chain['chainName']) {
    return this.signerOptionMap[chainName]
  }

  setPreferredSignType(chainName: Chain['chainName'], options: SignerOptions) {
    this.preferredSignTypeMap[chainName] = options?.preferredSignType?.(this.chainNameMap[chainName]) || 'amino'
  }

  getPreferredSignType(chainName: Chain['chainName']) {
    const chain = this.chainNameMap[chainName]
    return this.preferredSignTypeMap[chain.chainName]
  }

  setPreferredEndpoint(chainName: Chain['chainName'], endpointOption: EndpointOptions) {
    this.preferredEndpointMap[chainName] = endpointOption?.endpoints?.[chainName] || { rest: [], rpc: [] }
  }

  getPreferredEndpoint(chainName: Chain['chainName']) {
    return this.preferredEndpointMap[chainName]
  }
}