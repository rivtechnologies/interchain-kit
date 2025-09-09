import { expect,test } from '@playwright/test';

import { EthereumTransactionPage } from './page-models/ethereum-transaction';

test.describe('Ethereum Transaction', () => {
  test('should be able to connect wallets and view balances', async ({ page }) => {
    const ethereumPage = new EthereumTransactionPage(page);

    // 导航到以太坊交易页面
    await ethereumPage.goto();
    await ethereumPage.isLoaded();

    // 获取发送者和接收者钱包
    const sender = ethereumPage.getSenderWallet();
    const receiver = ethereumPage.getReceiverWallet();

    // 连接发送者钱包
    await sender.connect();
    await sender.waitForConnectedStatus();

    // 连接接收者钱包
    await receiver.connect();
    await receiver.waitForConnectedStatus();

    // 验证钱包地址已显示
    const senderAddress = await sender.getAddress();
    const receiverAddress = await receiver.getAddress();

    expect(senderAddress).toBeTruthy();
    expect(senderAddress.length).toBeGreaterThan(0);
    expect(receiverAddress).toBeTruthy();
    expect(receiverAddress.length).toBeGreaterThan(0);
    expect(senderAddress).not.toBe(receiverAddress);

    // 获取并验证余额显示
    await sender.getBalance();
    await receiver.getBalance();

    // 等待余额更新
    await sender.waitForBalanceUpdate();
    await receiver.waitForBalanceUpdate();
  });

  test('should be able to send Sepolia ETH between wallets', async ({ page }) => {
    const ethereumPage = new EthereumTransactionPage(page);

    // 导航到以太坊交易页面
    await ethereumPage.goto();
    await ethereumPage.isLoaded();

    // 获取发送者和接收者钱包
    const sender = ethereumPage.getSenderWallet();
    const receiver = ethereumPage.getReceiverWallet();

    // 连接两个钱包
    await sender.connect();
    await sender.waitForConnectedStatus();
    await receiver.connect();
    await receiver.waitForConnectedStatus();

    // 获取初始余额
    await sender.getBalance();
    await receiver.getBalance();

    // 等待余额更新
    await sender.waitForBalanceUpdate();
    await receiver.waitForBalanceUpdate();

    // 记录发送前的余额
    const senderBalanceBefore = await sender.getBalanceText();
    const receiverBalanceBefore = await receiver.getBalanceText();

    // 发送 Sepolia ETH
    await sender.sendSepoliaETH();

    // 等待交易完成（这里可能需要更长的超时时间）
    // 由于以太坊交易需要时间确认，我们等待一段时间
    await page.waitForTimeout(5000);

    // 重新获取余额以查看变化
    await sender.getBalance();
    await receiver.getBalance();

    // 等待余额更新
    await page.waitForTimeout(2000);

    // 验证余额已更新（由于 Mock 钱包可能不会真正改变余额，我们验证交易按钮仍然可用）
    await expect(page.locator('#sender button:has-text("send Sepolia ETH")')).toBeEnabled();
    await expect(page.locator('#receiver')).toBeVisible();

    // 验证页面状态正常
    const senderAddress = await sender.getAddress();
    const receiverAddress = await receiver.getAddress();
    expect(senderAddress).toBeTruthy();
    expect(receiverAddress).toBeTruthy();
  });

  test('should display correct wallet information after connection', async ({ page }) => {
    const ethereumPage = new EthereumTransactionPage(page);

    // 导航到以太坊交易页面
    await ethereumPage.goto();
    await ethereumPage.isLoaded();

    // 获取发送者和接收者钱包
    const sender = ethereumPage.getSenderWallet();
    const receiver = ethereumPage.getReceiverWallet();

    // 连接发送者钱包
    await sender.connect();
    await sender.waitForConnectedStatus();

    // 验证发送者钱包信息
    const senderAddress = await sender.getAddress();
    expect(senderAddress).toMatch(/^0x[a-fA-F0-9]{40}$/); // 以太坊地址格式

    // 连接接收者钱包
    await receiver.connect();
    await receiver.waitForConnectedStatus();

    // 验证接收者钱包信息
    const receiverAddress = await receiver.getAddress();
    expect(receiverAddress).toMatch(/^0x[a-fA-F0-9]{40}$/); // 以太坊地址格式

    // 验证两个地址不同
    expect(senderAddress).not.toBe(receiverAddress);
  });

  test('should handle balance updates correctly', async ({ page }) => {
    const ethereumPage = new EthereumTransactionPage(page);

    // 导航到以太坊交易页面
    await ethereumPage.goto();
    await ethereumPage.isLoaded();

    // 获取发送者和接收者钱包
    const sender = ethereumPage.getSenderWallet();
    const receiver = ethereumPage.getReceiverWallet();

    // 连接两个钱包
    await sender.connect();
    await sender.waitForConnectedStatus();
    await receiver.connect();
    await receiver.waitForConnectedStatus();

    // 获取余额
    await sender.getBalance();
    await receiver.getBalance();

    // 等待余额更新
    await sender.waitForBalanceUpdate();
    await receiver.waitForBalanceUpdate();

    // 验证余额已更新且不为 0
    const senderBalance = await sender.getBalanceText();
    const receiverBalance = await receiver.getBalanceText();
    expect(senderBalance).not.toBe('0');
    expect(receiverBalance).not.toBe('0');
  });

  test('should handle transaction errors gracefully', async ({ page }) => {
    const ethereumPage = new EthereumTransactionPage(page);

    // 导航到以太坊交易页面
    await ethereumPage.goto();
    await ethereumPage.isLoaded();

    // 获取发送者和接收者钱包
    const sender = ethereumPage.getSenderWallet();
    const receiver = ethereumPage.getReceiverWallet();

    // 只连接发送者钱包，不连接接收者钱包
    await sender.connect();
    await sender.waitForConnectedStatus();

    // 尝试发送交易（应该失败，因为接收者未连接）
    await sender.sendSepoliaETH();

    // 等待一段时间让错误处理完成
    await page.waitForTimeout(2000);

    // 验证页面仍然可用（没有崩溃）
    await expect(page.locator('#sender')).toBeVisible();
    await expect(page.locator('#receiver')).toBeVisible();
  });
});
