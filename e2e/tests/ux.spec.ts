import { test, expect } from '@playwright/test';
import { UxPage } from './page-models/ux';


test.describe('UX Test', () => {
  test('should able to change account', async ({ page }) => {
    const uxPage = new UxPage(page);

    // 导航到UX页面
    await uxPage.goto();
    await uxPage.expectPageLoaded();

    // 测试连接钱包
    await uxPage.clickConnect();

    // 假设连接钱包后有一个模态框需要确认（根据实际情况调整）
    // await page.getByRole('button', { name: '确认' }).click();

    // 验证账号已连接
    await uxPage.expectAccountConnected();

    // 记录初始账号地址
    const initialAddress = await uxPage.getAccountAddress();

    // 更改账号
    await uxPage.clickChangeAccount();

    // 验证账号已更改（注意：这里假设更改是同步的，如果是异步操作可能需要等待）
    // await page.waitForTimeout(1000); // 如果需要等待状态更新

    // 获取更改后的地址并进行验证
    const newAddress = await uxPage.getAccountAddress();
    expect(newAddress).not.toBe(initialAddress);
  });
});