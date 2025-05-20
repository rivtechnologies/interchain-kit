
import { getWCInfoByProjectId, isAndroid, isIOS } from "../utils";
import { WCWallet } from "./wc-wallet";

export class WCMobileWebWallet extends WCWallet {
  walletConnectData: any

  async navigateWalletConnectLink(uri: string) {
    // const appUrl = this.walletConnectData.mobile.native || this.walletConnectData.mobile.universal
    let wcUrl = ''
    if (isAndroid()) {
      wcUrl = this.info.walletConnectLink?.android?.replace('{wc-uri}', encodeURIComponent(uri))
    }
    if (isIOS()) {
      wcUrl = this.info.walletConnectLink?.ios?.replace('{wc-uri}', encodeURIComponent(uri))
    }

    if (wcUrl) {
      window.open(wcUrl, '_blank')
    }
  }

  async navigateToDappBrowserLink() {
    if (!this.info.dappBrowserLink) {
      return
    }
    window.location.href = this.info.dappBrowserLink(window.location.href)
  }

  async init() {
    // this.walletConnectData = await getWCInfoByProjectId(this.info.walletconnect.projectId)
    await super.init()
    this.provider.on('display_uri', async (uri: string) => {
      await this.navigateWalletConnectLink(uri)
      await this.navigateToDappBrowserLink()
    })
  }

  async connect() {
    await this.navigateToDappBrowserLink()
    await super.connect('')
  }
} 