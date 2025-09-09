import { expect,Page } from '@playwright/test';

export class SolanaTransactionPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // 导航到 Solana 交易页面
  async goto() {
    await this.page.goto('/solana/transaction');
  }

  // 检查页面是否加载完成
  async isLoaded() {
    await expect(this.page.locator('#sender')).toBeVisible();
    await expect(this.page.locator('#receiver')).toBeVisible();
    await expect(this.page.locator('#sender h1')).toContainText('Sender');
    await expect(this.page.locator('#receiver h1')).toContainText('Receiver');
  }

  // 获取发送者钱包区块
  getSenderWallet() {
    return new SolanaSenderWallet(this.page);
  }

  // 获取接收者钱包区块
  getReceiverWallet() {
    return new SolanaReceiverWallet(this.page);
  }
}

class SolanaSenderWallet {
  readonly page: Page;
  readonly rootLocator: any;

  constructor(page: Page) {
    this.page = page;
    this.rootLocator = page.locator('#sender');
  }

  // 连接发送者钱包
  async connect() {
    await this.rootLocator.getByRole('button', { name: 'connect sender' }).click();
  }

  // 获取余额
  async getBalance() {
    await this.rootLocator.getByRole('button', { name: 'getSenderBalance' }).click();
  }

  // 发送 SOL
  async sendSOL() {
    await this.rootLocator.getByRole('button', { name: 'send SOL' }).click();
  }

  // 获取地址
  async getAddress() {
    const addressText = await this.rootLocator.locator('div:has-text("account:")').textContent();
    return addressText?.replace('account: ', '').trim() || '';
  }

  // 获取余额
  async getBalanceText() {
    const balanceText = await this.rootLocator.locator('div:has-text("balance:")').textContent();
    return balanceText?.replace('balance: ', '').trim() || '';
  }

  // 等待余额更新
  async waitForBalanceUpdate(timeout = 30000) {
    await this.getBalance();

    await expect(async () => {
      const balanceText = await this.getBalanceText();
      expect(balanceText).not.toBe('0');
    }).toPass({ timeout });
  }

  // 检查是否已连接
  async isConnected() {
    const address = await this.getAddress();
    return address && address.length > 0;
  }

  // 等待连接状态
  async waitForConnectedStatus(timeout = 10000) {
    await expect(async () => {
      const isConnected = await this.isConnected();
      expect(isConnected).toBe(true);
    }).toPass({ timeout });
  }
}

class SolanaReceiverWallet {
  readonly page: Page;
  readonly rootLocator: any;

  constructor(page: Page) {
    this.page = page;
    this.rootLocator = page.locator('#receiver');
  }

  // 连接接收者钱包
  async connect() {
    await this.rootLocator.getByRole('button', { name: 'connect receiver' }).click();
  }

  // 获取余额
  async getBalance() {
    await this.rootLocator.getByRole('button', { name: 'getReceiverBalance' }).click();
  }

  // 获取地址
  async getAddress() {
    const addressText = await this.rootLocator.locator('div:has-text("account:")').textContent();
    return addressText?.replace('account: ', '').trim() || '';
  }

  // 获取余额
  async getBalanceText() {
    const balanceText = await this.rootLocator.locator('div:has-text("balance:")').textContent();
    return balanceText?.replace('balance: ', '').trim() || '';
  }

  // 等待余额更新
  async waitForBalanceUpdate(timeout = 30000) {
    await this.getBalance();

    await expect(async () => {
      const balanceText = await this.getBalanceText();
      expect(balanceText).not.toBe('0');
    }).toPass({ timeout });
  }

  // 检查是否已连接
  async isConnected() {
    const address = await this.getAddress();
    return address && address.length > 0;
  }

  // 等待连接状态
  async waitForConnectedStatus(timeout = 10000) {
    await expect(async () => {
      const isConnected = await this.isConnected();
      expect(isConnected).toBe(true);
    }).toPass({ timeout });
  }

  // 等待余额包含特定金额（用于验证交易是否成功）
  async waitForBalanceWithAmount(amount: string, timeout = 30000) {
    await this.getBalance();

    await expect(async () => {
      const balanceText = await this.getBalanceText();
      expect(balanceText).toContain(amount);
    }).toPass({ timeout });
  }
}
