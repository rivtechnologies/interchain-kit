export class WalletConnectPage {
  private page: any;
  private connectButton: any;
  private disconnectButton: any;
  private openModalButton: any;
  private walletState: any;

  constructor(page: any) {
    this.page = page;
    this.connectButton = page.locator('[data-testid="connect-wallet-btn"]');
    this.disconnectButton = page.locator('[data-testid="disconnect-wallet-btn"]');
    this.openModalButton = page.locator('[data-testid="open-modal-btn"]');
    this.walletState = page.locator('#wallet-state');
  }

  async isConnected() {
    await this.page.waitForSelector('#wallet-state');
    return await this.walletState.textContent() === 'Connected';
  }

  async isDisconnected() {
    await this.page.waitForSelector('#wallet-state');
    return await this.walletState.textContent() === 'Disconnected';
  }

  async connect() {
    await this.connectButton.click();
  }

  async disconnect() {
    await this.disconnectButton.click();
  }

  async openModal() {
    await this.openModalButton.click();
  }


}