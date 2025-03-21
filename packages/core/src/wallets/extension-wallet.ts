import { SignOptions } from "../types";
import { clientNotExistError, getClientFromExtension } from "../utils";
import { MultiChainWallet } from "./multichain-wallet";

export class ExtensionWallet extends MultiChainWallet {
  isExtensionInstalled: boolean = false;

  defaultSignOptions = {
    preferNoSetFee: false,
    preferNoSetMemo: true,
    disableBalanceCheck: false,
  }

  setSignOptions(options: SignOptions) {
    this.defaultSignOptions = {
      preferNoSetFee: options.preferNoSetFee,
      preferNoSetMemo: options.preferNoSetMemo,
      disableBalanceCheck: options.disableBalanceCheck
    }

    const wallet = this.networkWalletMap.get('cosmos')
    wallet.client.defaultOptions = this.defaultSignOptions
  }

  async init() {
    try {
      const walletIdentify = await getClientFromExtension(this.info.walletIdentifyKey)
      if (!walletIdentify) {
        throw clientNotExistError
      }
      await super.init();
      this.isExtensionInstalled = true;
    } catch (error) {
      this.errorMessage = clientNotExistError.message;
      this.isExtensionInstalled = false;
    }
  }
}