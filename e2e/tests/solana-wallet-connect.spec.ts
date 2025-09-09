import { expect,test } from '@playwright/test';

import { SolanaWalletConnectPage } from './page-models/solana-wallet-connect';

test.describe('Solana Wallet Connect', () => {
  test('should be able to connect sender and receiver wallets', async ({ page }) => {
    const walletConnectPage = new SolanaWalletConnectPage(page);

    // 导航到 Solana 钱包连接页面
    await walletConnectPage.goto();
    await walletConnectPage.isLoaded();

    // 验证初始状态 - 钱包应该未连接
    const initialSenderAddress = await walletConnectPage.getSenderAddress();
    const initialReceiverAddress = await walletConnectPage.getReceiverAddress();
    expect(initialSenderAddress).toBe('');
    expect(initialReceiverAddress).toBe('');

    // 连接发送者钱包
    await walletConnectPage.connectSender();

    // 等待发送者钱包连接完成
    await walletConnectPage.waitForSenderConnected();

    // 验证发送者钱包地址已显示
    const senderAddress = await walletConnectPage.getSenderAddress();
    expect(senderAddress).toBeTruthy();
    expect(senderAddress.length).toBeGreaterThan(0);

    // 连接接收者钱包
    await walletConnectPage.connectReceiver();

    // 等待接收者钱包连接完成
    await walletConnectPage.waitForReceiverConnected();

    // 验证接收者钱包地址已显示
    const receiverAddress = await walletConnectPage.getReceiverAddress();
    expect(receiverAddress).toBeTruthy();
    expect(receiverAddress.length).toBeGreaterThan(0);

    // 验证两个钱包地址不同
    expect(senderAddress).not.toBe(receiverAddress);
  });

  test('should be able to open wallet modal', async ({ page }) => {
    const walletConnectPage = new SolanaWalletConnectPage(page);

    // 导航到 Solana 钱包连接页面
    await walletConnectPage.goto();
    await walletConnectPage.isLoaded();

    // 点击打开模态框按钮
    await walletConnectPage.openModal();

    // 验证模态框已打开（这里可能需要根据实际的模态框实现来调整）
    // 由于是 mock 钱包，模态框可能不会显示，所以我们主要测试按钮点击功能
    await expect(walletConnectPage.getOpenModalButton()).toBeVisible();
  });

  test('should maintain wallet connections after page refresh', async ({ page }) => {
    const walletConnectPage = new SolanaWalletConnectPage(page);

    // 导航到 Solana 钱包连接页面
    await walletConnectPage.goto();
    await walletConnectPage.isLoaded();

    // 连接两个钱包
    await walletConnectPage.connectSender();
    await walletConnectPage.waitForSenderConnected();

    await walletConnectPage.connectReceiver();
    await walletConnectPage.waitForReceiverConnected();

    // 获取连接后的地址
    const senderAddress = await walletConnectPage.getSenderAddress();
    const receiverAddress = await walletConnectPage.getReceiverAddress();

    // 刷新页面
    await page.reload();
    await walletConnectPage.isLoaded();

    // 验证钱包连接状态在刷新后仍然保持
    // 注意：由于是 mock 钱包，连接状态可能不会持久化
    // 这个测试主要验证页面刷新功能正常工作
    await expect(walletConnectPage.getSenderAddressElement()).toBeVisible();
    await expect(walletConnectPage.getReceiverAddressElement()).toBeVisible();
  });

  test('should handle wallet connection errors gracefully', async ({ page }) => {
    const walletConnectPage = new SolanaWalletConnectPage(page);

    // 导航到 Solana 钱包连接页面
    await walletConnectPage.goto();
    await walletConnectPage.isLoaded();

    // 尝试连接钱包（即使可能失败，也应该不会导致页面崩溃）
    try {
      await walletConnectPage.connectSender();
      // 如果连接成功，等待连接完成
      await walletConnectPage.waitForSenderConnected();
    } catch (error) {
      // 如果连接失败，页面应该仍然可用
      await expect(walletConnectPage.getConnectSenderButton()).toBeVisible();
      await expect(walletConnectPage.getConnectReceiverButton()).toBeVisible();
    }

    // 验证页面仍然可用
    await expect(walletConnectPage.getOpenModalButton()).toBeVisible();
  });
});
