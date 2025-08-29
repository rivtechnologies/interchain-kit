import { Page, expect } from '@playwright/test';

export class EthereumWalletConnectPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Navigate to the Ethereum wallet connect page
  async goto() {
    await this.page.goto('/ethereum/wallet-connect');
  }

  // Check if the page is loaded
  async isLoaded() {
    // Wait for the main elements to be visible
    await expect(this.page.locator('button:has-text("connect sender")')).toBeVisible();
    await expect(this.page.locator('button:has-text("connect receiver")')).toBeVisible();
    await expect(this.page.locator('button:has-text("Open Modal")')).toBeVisible();
  }

  // Connect sender wallet
  async connectSenderWallet() {
    await this.page.locator('button:has-text("connect sender")').click();
  }

  // Connect receiver wallet
  async connectReceiverWallet() {
    await this.page.locator('button:has-text("connect receiver")').click();
  }

  // Open wallet modal
  async openModal() {
    await this.page.locator('button:has-text("Open Modal")').click();
  }

  // Get sender wallet address - use more specific selector
  async getSenderAddress(): Promise<string> {
    // Use a more specific selector to avoid multiple matches
    const addressElement = this.page.locator('div').filter({ hasText: /^sender: / }).first();
    const text = await addressElement.textContent();
    if (!text) return '';
    
    // Extract address from "sender: 0x..." format
    const match = text.match(/sender:\s*(0x[a-fA-F0-9]{40})/);
    return match ? match[1] : '';
  }

  // Get receiver wallet address - use more specific selector
  async getReceiverAddress(): Promise<string> {
    // Use a more specific selector to avoid multiple matches
    const addressElement = this.page.locator('div').filter({ hasText: /^receiver: / }).first();
    const text = await addressElement.textContent();
    if (!text) return '';
    
    // Extract address from "receiver: 0x..." format
    const match = text.match(/receiver:\s*(0x[a-fA-F0-9]{40})/);
    return match ? match[1] : '';
  }

  // Wait for sender wallet to be connected
  async waitForSenderConnected(timeout = 10000) {
    await expect(async () => {
      const address = await this.getSenderAddress();
      expect(address).toBeTruthy();
      expect(address.length).toBeGreaterThan(0);
    }).toPass({ timeout });
  }

  // Wait for receiver wallet to be connected
  async waitForReceiverConnected(timeout = 10000) {
    await expect(async () => {
      const address = await this.getReceiverAddress();
      expect(address).toBeTruthy();
      expect(address.length).toBeGreaterThan(0);
    }).toPass({ timeout });
  }

  // Check if sender wallet is connected
  async isSenderConnected(): Promise<boolean> {
    const address = await this.getSenderAddress();
    return address && address.length > 0;
  }

  // Check if receiver wallet is connected
  async isReceiverConnected(): Promise<boolean> {
    const address = await this.getReceiverAddress();
    return address && address.length > 0;
  }

  // Wait for both wallets to be connected
  async waitForBothWalletsConnected(timeout = 15000) {
    await this.waitForSenderConnected(timeout);
    await this.waitForReceiverConnected(timeout);
  }

  // Check if both wallets are connected
  async areBothWalletsConnected(): Promise<boolean> {
    const senderConnected = await this.isSenderConnected();
    const receiverConnected = await this.isReceiverConnected();
    return senderConnected && receiverConnected;
  }

  // Get wallet connection status summary
  async getConnectionStatus() {
    const sender = await this.isSenderConnected();
    const receiver = await this.isReceiverConnected();
    const senderAddress = await this.getSenderAddress();
    const receiverAddress = await this.getReceiverAddress();
    
    return {
      sender,
      receiver,
      senderAddress,
      receiverAddress
    };
  }
}
