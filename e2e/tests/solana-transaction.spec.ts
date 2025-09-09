import { expect,test } from '@playwright/test';

import { SolanaTransactionPage } from './page-models/solana-transaction';

test.describe('Solana Transaction', () => {
  test('should be able to connect wallets and view balances', async ({ page }) => {
    const solanaPage = new SolanaTransactionPage(page);

    // 导航到 Solana 交易页面
    await solanaPage.goto();
    await solanaPage.isLoaded();

    // 获取发送者和接收者钱包
    const sender = solanaPage.getSenderWallet();
    const receiver = solanaPage.getReceiverWallet();

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

  test('should be able to send SOL between wallets', async ({ page }) => {
    const solanaPage = new SolanaTransactionPage(page);

    // 导航到 Solana 交易页面
    await solanaPage.goto();
    await solanaPage.isLoaded();

    // 获取发送者和接收者钱包
    const sender = solanaPage.getSenderWallet();
    const receiver = solanaPage.getReceiverWallet();

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

    // 发送 SOL
    await sender.sendSOL();

    // 等待交易完成（这里可能需要更长的超时时间）
    // 由于 Solana 交易需要时间确认，我们等待一段时间
    await page.waitForTimeout(5000);

    // 重新获取余额以查看变化
    await sender.getBalance();
    await receiver.getBalance();

    // 验证余额已更新
    await expect(async () => {
      const senderBalanceAfter = await sender.getBalanceText();
      const receiverBalanceAfter = await receiver.getBalanceText();

      // 余额应该已经改变（由于交易费用和发送的金额）
      expect(senderBalanceAfter).not.toBe(senderBalanceBefore);
      expect(receiverBalanceAfter).not.toBe(receiverBalanceBefore);
    }).toPass({ timeout: 30000 });
  });
});
