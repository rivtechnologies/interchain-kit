import { expect } from "@playwright/test";


export class WalletModalModel {
  private closeButton: any;
  private modal: any;

  constructor(private page: any) {
    this.page = page;
    this.modal = page.locator('div[data-floating-ui-focusable]:has(div[data-modal-part="content"])');
  }
  async isOpen() {
    await expect(this.modal).toBeVisible();
  }

  async isSelectWalletVisible() {
    await this.isOpen()
    await expect(this.page.locator('text=select your wallet')).toBeVisible();
  }

  async isConnectedWalletVisible(walletName: string) {
    await this.isOpen();
    await expect(this.modal).toContainText(`${walletName}`);
  }

  async closeModal() {
    await this.closeButton.click();
  }

  async connectWallet(walletName: string) {
    await this.page.click(`button[title="${walletName}"]`);
  }

  async disconnectWallet(walletName: string) {
    await this.isConnectedWalletVisible(walletName);
    const button = this.modal.locator(`button:has-text("Disconnect")`);
    await button.click();
  }

  async isNotExistWalletVisible(walletName: string) {
    await this.isOpen();
    await expect(this.modal).toContainText(`${walletName} Not Installed`);
  }
}