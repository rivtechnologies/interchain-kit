import { test, expect } from '@playwright/test';
import { EthereumUxPage } from './page-models/ethereum-ux';
import { mockEthereumWallet } from './utils/mock-ethereum-wallet';

test.describe('Ethereum UX Test', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Ethereum wallet before each test
    await mockEthereumWallet(page);
  });

  test('should be able to connect wallet and change account', async ({ page }) => {
    const ethereumUxPage = new EthereumUxPage(page);

    // 导航到Ethereum UX页面
    await ethereumUxPage.goto();
    await ethereumUxPage.expectPageLoaded();

    // 测试连接钱包
    await ethereumUxPage.clickConnect();

    // 等待账号连接完成
    await ethereumUxPage.waitForAccountUpdate();

    // 验证账号已连接
    await ethereumUxPage.expectAccountConnected();

    // 验证账号地址格式为有效的Ethereum地址
    await ethereumUxPage.expectValidEthereumAddress();

    // 记录初始账号地址
    const initialAddress = await ethereumUxPage.getAccountAddress();
    expect(initialAddress.length).toBeGreaterThan(0);

    // 更改账号
    await ethereumUxPage.clickChangeAccount();

    // 等待账号地址变化
    await ethereumUxPage.waitForAccountChange(initialAddress);

    // 验证账号已更改
    await ethereumUxPage.expectAccountChanged(initialAddress);

    // 验证新账号地址格式也为有效的Ethereum地址
    await ethereumUxPage.expectValidEthereumAddress();
  });

  test('should display wallet address in correct Ethereum format', async ({ page }) => {
    const ethereumUxPage = new EthereumUxPage(page);

    // 导航到Ethereum UX页面
    await ethereumUxPage.goto();
    await ethereumUxPage.expectPageLoaded();

    // 连接钱包
    await ethereumUxPage.clickConnect();
    await ethereumUxPage.waitForAccountUpdate();

    // 验证账号地址格式
    await ethereumUxPage.expectValidEthereumAddress();

    // 获取并验证地址长度
    const address = await ethereumUxPage.getAccountAddress();
    expect(address).toHaveLength(42); // 0x + 40 hex characters
  });

  test('should handle multiple account changes correctly', async ({ page }) => {
    const ethereumUxPage = new EthereumUxPage(page);

    // 导航到Ethereum UX页面
    await ethereumUxPage.goto();
    await ethereumUxPage.expectPageLoaded();

    // 连接钱包
    await ethereumUxPage.clickConnect();
    await ethereumUxPage.waitForAccountUpdate();
    await ethereumUxPage.expectAccountConnected();

    // 记录第一个账号地址
    const firstAddress = await ethereumUxPage.getAccountAddress();
    expect(firstAddress.length).toBeGreaterThan(0);

    // 第一次更改账号
    await ethereumUxPage.clickChangeAccount();
    await ethereumUxPage.waitForAccountChange(firstAddress);
    await ethereumUxPage.expectAccountChanged(firstAddress);

    // 记录第二个账号地址
    const secondAddress = await ethereumUxPage.getAccountAddress();
    expect(secondAddress).not.toBe(firstAddress);

    // 第二次更改账号
    await ethereumUxPage.clickChangeAccount();
    await ethereumUxPage.waitForAccountChange(secondAddress);
    await ethereumUxPage.expectAccountChanged(secondAddress);

    // 验证新地址与之前的地址不同（考虑到mock wallet可能只有有限数量的地址）
    const thirdAddress = await ethereumUxPage.getAccountAddress();
    expect(thirdAddress.length).toBeGreaterThan(0);

    // 验证至少有一个地址变化了
    const addresses = [firstAddress, secondAddress, thirdAddress];
    const uniqueAddresses = new Set(addresses);
    expect(uniqueAddresses.size).toBeGreaterThan(1);
  });

  test('should maintain wallet connection after account changes', async ({ page }) => {
    const ethereumUxPage = new EthereumUxPage(page);

    // 导航到Ethereum UX页面
    await ethereumUxPage.goto();
    await ethereumUxPage.expectPageLoaded();

    // 连接钱包
    await ethereumUxPage.clickConnect();
    await ethereumUxPage.waitForAccountUpdate();
    await ethereumUxPage.expectAccountConnected();

    // 多次更改账号
    for (let i = 0; i < 3; i++) {
      const currentAddress = await ethereumUxPage.getAccountAddress();
      await ethereumUxPage.clickChangeAccount();
      await ethereumUxPage.waitForAccountChange(currentAddress);
      await ethereumUxPage.expectAccountChanged(currentAddress);
    }

    // 验证钱包仍然保持连接状态
    await ethereumUxPage.expectAccountConnected();
    await ethereumUxPage.expectValidEthereumAddress();
  });
});
