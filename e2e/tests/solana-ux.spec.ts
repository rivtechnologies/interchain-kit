import { test, expect } from '@playwright/test';
import { SolanaUxPage } from './page-models/solana-ux';

test.describe('Solana UX Test', () => {
  test('should be able to connect wallet and change account', async ({ page }) => {
    const solanaUxPage = new SolanaUxPage(page);

    // 导航到Solana UX页面
    await solanaUxPage.goto();
    await solanaUxPage.expectPageLoaded();

    // 测试连接钱包
    await solanaUxPage.clickConnect();

    // 等待账号连接完成
    await solanaUxPage.waitForAccountUpdate();

    // 验证账号已连接
    await solanaUxPage.expectAccountConnected();

    // 记录初始账号地址
    const initialAddress = await solanaUxPage.getAccountAddress();
    expect(initialAddress.length).toBeGreaterThan(0);

    // 更改账号
    await solanaUxPage.clickChangeAccount();

    // 等待账号地址变化
    await solanaUxPage.waitForAccountChange(initialAddress);

    // 验证账号已更改
    await solanaUxPage.expectAccountChanged(initialAddress);
  });
});
