import { CosmosWallet, ExtensionWallet } from '@interchain-kit/core';
import { AminoGenericOfflineSigner } from '@interchainjs/cosmos/types/wallet';
import { IGenericOfflineSigner } from '@interchainjs/types';

import { stationExtensionInfo } from './registry';


export * from './registry';

const stationWallet = new ExtensionWallet(stationExtensionInfo);

class StationCosmosWallet extends CosmosWallet {
  async getOfflineSigner(chainId: string) {
    return new AminoGenericOfflineSigner(this.client.getOfflineSigner(chainId)) as IGenericOfflineSigner;
  }
}


stationWallet.setNetworkWallet('cosmos', new StationCosmosWallet(stationExtensionInfo));

export { stationWallet };