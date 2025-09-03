import { SignOptions } from '../types';
import { getClientFromExtension } from '../utils';
import { clientNotExistError } from '../utils/errors';
import { CosmosWallet } from './cosmos-wallet';
import { MultiChainWallet } from './multichain-wallet';
export class ExtensionWallet extends MultiChainWallet {
  async init() {
    const walletIdentify = await getClientFromExtension(this.info.windowKey);
    if (!walletIdentify) {
      throw clientNotExistError;
    }
    await super.init();
  }

  setSignOptions(options: SignOptions) {
    const wallet = this.getWalletByChainType('cosmos');
    if (wallet instanceof CosmosWallet) {
      wallet.setSignOptions(options);
    }
  }

}