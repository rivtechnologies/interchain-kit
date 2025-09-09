import { expect,Page } from '@playwright/test';

export class SolanaWalletConnectPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // 导航到 Solana 钱包连接页面
  async goto() {
    await this.page.goto('/solana/wallet-connect');
  }

  // 检查页面是否加载完成
  async isLoaded() {
    await expect(this.page.locator('button:has-text("connect sender")')).toBeVisible();
    await expect(this.page.locator('button:has-text("connect receiver")')).toBeVisible();
    await expect(this.page.locator('button:has-text("Open Modal")')).toBeVisible();
  }

  // 获取连接发送者钱包按钮
  getConnectSenderButton() {
    return this.page.locator('button:has-text("connect sender")');
  }

  // 获取连接接收者钱包按钮
  getConnectReceiverButton() {
    return this.page.locator('button:has-text("connect receiver")');
  }

  // 获取打开模态框按钮
  getOpenModalButton() {
    return this.page.locator('button:has-text("Open Modal")');
  }

  // 连接发送者钱包
  async connectSender() {
    await this.getConnectSenderButton().click();
  }

  // 连接接收者钱包
  async connectReceiver() {
    await this.getConnectReceiverButton().click();
  }

  // 打开钱包模态框
  async openModal() {
    await this.getOpenModalButton().click();
  }

  // 获取发送者地址元素
  getSenderAddressElement() {
    return this.page.locator('div:has-text("sender:")').filter({ hasText: /^sender: / });
  }

  // 获取接收者地址元素
  getReceiverAddressElement() {
    return this.page.locator('div:has-text("receiver:")').filter({ hasText: /^receiver: / });
  }

  // 获取发送者地址文本
  async getSenderAddressText(): Promise<string> {
    const addressElement = this.getSenderAddressElement();
    const text = await addressElement.textContent();
    return text?.replace('sender: ', '').trim() || '';
  }

  // 获取接收者地址文本
  async getReceiverAddressText(): Promise<string> {
    const addressElement = this.getReceiverAddressElement();
    const text = await addressElement.textContent();
    return text?.replace('receiver: ', '').trim() || '';
  }

  // 等待发送者钱包连接完成
  async waitForSenderConnected(timeout = 10000) {
    await expect(async () => {
      const address = await this.getSenderAddressText();
      expect(address).toBeTruthy();
      expect(address).not.toBe('undefined');
      expect(address.length).toBeGreaterThan(0);
    }).toPass({ timeout });
  }

  // 等待接收者钱包连接完成
  async waitForReceiverConnected(timeout = 10000) {
    await expect(async () => {
      const address = await this.getReceiverAddressText();
      expect(address).toBeTruthy();
      expect(address).not.toBe('undefined');
      expect(address.length).toBeGreaterThan(0);
    }).toPass({ timeout });
  }

  // 检查发送者钱包是否已连接
  async isSenderConnected() {
    const address = await this.getSenderAddressText();
    return address && address !== 'undefined' && address.length > 0;
  }

  // 检查接收者钱包是否已连接
  async isReceiverConnected() {
    const address = await this.getReceiverAddressText();
    return address && address !== 'undefined' && address.length > 0;
  }

  // 获取发送者地址（用于测试验证）
  async getSenderAddress(): Promise<string> {
    return await this.getSenderAddressText();
  }

  // 获取接收者地址（用于测试验证）
  async getReceiverAddress(): Promise<string> {
    return await this.getReceiverAddressText();
  }
}
