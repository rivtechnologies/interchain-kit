import { Page, expect } from '@playwright/test';

export class TransactionPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // 導航到交易頁面
  async goto() {
    await this.page.goto('/transaction');
  }

  // 獲取發送者錢包元素
  getSenderWallet(chainName: string) {
    return new SenderWalletBlock(this.page, chainName);
  }

  // 獲取接收者錢包元素
  getReceiverWallet() {
    return new ReceiverWalletBlock(this.page);
  }

  // 檢查頁面是否加載完成
  async isLoaded() {
    await expect(this.page.getByTestId('sender-wallet-osmosis')).toBeVisible();
    await expect(this.page.getByTestId('sender-wallet-cosmoshub')).toBeVisible();
    await expect(this.page.getByTestId('receiver-wallet')).toBeVisible();
  }
}

class SenderWalletBlock {
  readonly page: Page;
  readonly chainName: string;
  readonly rootLocator: any;
  readonly amountToSend: string;

  constructor(page: Page, chainName: string) {
    this.page = page;
    this.chainName = chainName;
    // 找到特定鏈名稱的發送者錢包區塊
    this.rootLocator = page.getByTestId(`sender-wallet-${chainName}`);

    // 根據頁面中的設定，設置默認的發送金額
    this.amountToSend = chainName === 'osmosis' ? '1111111111' : '2222222222';
  }

  // 連接發送者錢包
  async connect() {
    await this.rootLocator.getByRole('button', { name: 'connect' }).click();
  }

  // 從水龍頭獲取代幣
  async faucet() {
    await this.rootLocator.getByRole('button', { name: 'faucet sender wallet' }).click();
  }

  // 獲取餘額
  async getBalance() {
    await this.rootLocator.getByRole('button', { name: 'get balance' }).click();
  }

  // 發送代幣
  async sendToken() {
    await this.rootLocator.getByRole('button', { name: /send token/ }).click();
  }

  // 獲取地址
  async getAddress() {
    const addressText = await this.rootLocator.locator('p').first().textContent();
    return addressText.replace('address: ', '').trim();
  }

  // 獲取餘額文本
  async getBalanceText() {
    // 獲取顯示餘額的段落
    const balanceParagraph = this.rootLocator.locator('p').last();
    return balanceParagraph.textContent();
  }

  // 等待餘額更新
  async waitForBalanceUpdate(timeout = 30000) {
    // 首先獲取當前餘額
    await this.getBalance();

    // 等待餘額元素出現並且不為空
    await expect(this.rootLocator.locator('p').last()).toBeVisible();
    await expect(async () => {
      const text = await this.rootLocator.locator('p').last().textContent();
      expect(text.trim()).not.toBe('');
    }).toPass({ timeout });
  }

  // 檢查發送代幣是否完成
  async isSendTokenDone(timeout = 10000) {
    await expect(this.rootLocator.getByRole('button', { name: /send token.*\(done\)/ })).toBeVisible({ timeout });
    return true;
  }

  // 獲取發送代幣的金額
  getAmountToSend() {
    return this.amountToSend;
  }
}

class ReceiverWalletBlock {
  readonly page: Page;
  readonly rootLocator: any;

  constructor(page: Page) {
    this.page = page;
    this.rootLocator = page.getByTestId('receiver-wallet');
  }

  // 連接接收者錢包
  async connect() {
    await this.rootLocator.getByRole('button', { name: 'connect' }).click();
  }

  // 獲取餘額
  async getBalances() {
    await this.rootLocator.getByRole('button', { name: 'get balances' }).click();
  }

  // 獲取地址
  async getAddress() {
    const addressText = await this.rootLocator.locator('p').first().textContent();
    return addressText.replace('address: ', '').trim();
  }

  // 獲取狀態
  async getStatus() {
    const statusText = await this.rootLocator.locator('p').nth(1).textContent();
    return statusText.replace('status:', '').trim();
  }

  // 獲取餘額文本
  async getBalanceText() {
    // 獲取顯示餘額的段落
    const balanceParagraph = this.rootLocator.locator('p').last();
    return balanceParagraph.textContent();
  }

  // 等待餘額更新，並檢查是否包含特定金額
  async waitForBalanceWithAmount(amount: string, timeout = 30000) {
    await this.getBalances();

    // 等待餘額元素出現並包含指定金額
    await expect(async () => {
      const text = await this.getBalanceText();
      expect(text).toContain(amount);
    }).toPass({ timeout });
  }

  // 等待連接狀態
  async waitForConnectedStatus(timeout = 10000) {
    await expect(async () => {
      const status = await this.getStatus();
      expect(status).toBe('Connected');
    }).toPass({ timeout });
  }
}