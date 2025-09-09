import { expect,Locator, Page } from '@playwright/test';

/**
 * Page Model 类，代表UX页面的交互和元素
 */
export class UxPage {
  readonly page: Page;

  // 页面元素
  readonly accountInfo: Locator;
  readonly connectButton: Locator;
  readonly changeAccountButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // 初始化元素定位器
    this.accountInfo = page.locator('p:has-text("account:")');
    this.connectButton = page.getByRole('button', { name: 'connect' });
    this.changeAccountButton = page.getByRole('button', { name: 'changeAccount' });
  }

  /**
   * 导航到UX页面
   */
  async goto() {
    await this.page.goto('/cosmos/ux');
  }

  /**
   * 点击连接钱包按钮
   */
  async clickConnect() {
    await this.connectButton.click();
  }

  /**
   * 点击更改账号按钮
   */
  async clickChangeAccount() {
    await this.changeAccountButton.click();
  }

  /**
   * 获取当前显示的账号地址
   */
  async getAccountAddress(): Promise<string> {
    const accountText = await this.accountInfo.textContent();
    return accountText ? accountText.replace('account:', '').trim() : '';
  }


  /**
   * 验证页面是否已加载
   */
  async expectPageLoaded() {
    await expect(this.connectButton).toBeVisible();
    await expect(this.changeAccountButton).toBeVisible();
  }

  /**
   * 验证账号地址是否已更新（非空）
   */
  async expectAccountConnected() {
    const address = await this.getAccountAddress();
    expect(address.length).toBeGreaterThan(0);
  }
}