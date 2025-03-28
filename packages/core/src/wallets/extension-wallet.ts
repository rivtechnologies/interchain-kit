
import { Wallet } from "../types";
import { clientNotExistError, getClientFromExtension } from "../utils";
import { MultiChainWallet } from "./multichain-wallet";

export class ExtensionWallet extends MultiChainWallet {
  async init() {
    const walletIdentify = await getClientFromExtension(this.info.walletIdentifyKey)
    if (!walletIdentify) {
      throw clientNotExistError
    }
    await super.init();
  }
}