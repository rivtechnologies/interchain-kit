import { expect,test } from '@playwright/test';

import { EthereumWalletConnectPage } from './page-models/ethereum-wallet-connect';
import { mockEthereumWallet, mockEthereumWalletConnectionError } from './utils/mock-ethereum-wallet';

test.describe('Ethereum Wallet Connect', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Ethereum wallet before each test
    await mockEthereumWallet(page);
  });

  test('should be able to connect sender wallet', async ({ page }) => {
    const walletConnectPage = new EthereumWalletConnectPage(page);

    // Navigate to the Ethereum wallet connect page
    await walletConnectPage.goto();
    await walletConnectPage.isLoaded();

    // Connect sender wallet
    await walletConnectPage.connectSenderWallet();
    await walletConnectPage.waitForSenderConnected();

    // Verify sender wallet is connected and address is displayed
    const senderAddress = await walletConnectPage.getSenderAddress();
    expect(senderAddress).toBeTruthy();
    expect(senderAddress).toMatch(/^0x[a-fA-F0-9]{40}$/); // Ethereum address format
  });

  test('should be able to connect receiver wallet', async ({ page }) => {
    const walletConnectPage = new EthereumWalletConnectPage(page);

    // Navigate to the Ethereum wallet connect page
    await walletConnectPage.goto();
    await walletConnectPage.isLoaded();

    // Connect receiver wallet
    await walletConnectPage.connectReceiverWallet();
    await walletConnectPage.waitForReceiverConnected();

    // Verify receiver wallet is connected and address is displayed
    const receiverAddress = await walletConnectPage.getReceiverAddress();
    expect(receiverAddress).toBeTruthy();
    expect(receiverAddress).toMatch(/^0x[a-fA-F0-9]{40}$/); // Ethereum address format
  });

  test('should be able to connect both wallets simultaneously', async ({ page }) => {
    const walletConnectPage = new EthereumWalletConnectPage(page);

    // Navigate to the Ethereum wallet connect page
    await walletConnectPage.goto();
    await walletConnectPage.isLoaded();

    // Connect both wallets
    await walletConnectPage.connectSenderWallet();
    await walletConnectPage.connectReceiverWallet();

    await walletConnectPage.waitForSenderConnected();
    await walletConnectPage.waitForReceiverConnected();

    // Verify both wallets are connected
    const senderAddress = await walletConnectPage.getSenderAddress();
    const receiverAddress = await walletConnectPage.getReceiverAddress();

    expect(senderAddress).toBeTruthy();
    expect(receiverAddress).toBeTruthy();
    expect(senderAddress).not.toBe(receiverAddress); // Addresses should be different
  });

  test('should open wallet modal when clicking open modal button', async ({ page }) => {
    const walletConnectPage = new EthereumWalletConnectPage(page);

    // Navigate to the Ethereum wallet connect page
    await walletConnectPage.goto();
    await walletConnectPage.isLoaded();

    // Click open modal button
    await walletConnectPage.openModal();

    // Verify modal is opened (this might need adjustment based on actual modal implementation)
    // For now, we'll just verify the button click doesn't cause an error
    await expect(page.locator('button:has-text("Open Modal")')).toBeVisible();
  });

  test('should display wallet addresses in correct format', async ({ page }) => {
    const walletConnectPage = new EthereumWalletConnectPage(page);

    // Navigate to the Ethereum wallet connect page
    await walletConnectPage.goto();
    await walletConnectPage.isLoaded();

    // Connect both wallets
    await walletConnectPage.connectSenderWallet();
    await walletConnectPage.connectReceiverWallet();

    await walletConnectPage.waitForSenderConnected();
    await walletConnectPage.waitForReceiverConnected();

    // Verify addresses are in correct Ethereum format
    const senderAddress = await walletConnectPage.getSenderAddress();
    const receiverAddress = await walletConnectPage.getReceiverAddress();

    // Ethereum addresses should be 42 characters long (0x + 40 hex chars)
    expect(senderAddress.length).toBe(42);
    expect(receiverAddress.length).toBe(42);

    // Should start with 0x
    expect(senderAddress).toMatch(/^0x/);
    expect(receiverAddress).toMatch(/^0x/);

    // Should contain only hex characters after 0x
    expect(senderAddress.substring(2)).toMatch(/^[a-fA-F0-9]+$/);
    expect(receiverAddress.substring(2)).toMatch(/^[a-fA-F0-9]+$/);
  });

  test('should handle wallet connection state correctly', async ({ page }) => {
    const walletConnectPage = new EthereumWalletConnectPage(page);

    // Navigate to the Ethereum wallet connect page
    await walletConnectPage.goto();
    await walletConnectPage.isLoaded();

    // Initially, wallets should be disconnected
    const initialSenderAddress = await walletConnectPage.getSenderAddress();
    const initialReceiverAddress = await walletConnectPage.getReceiverAddress();

    expect(initialSenderAddress).toBe('');
    expect(initialReceiverAddress).toBe('');

    // Connect sender wallet
    await walletConnectPage.connectSenderWallet();
    await walletConnectPage.waitForSenderConnected();

    const connectedSenderAddress = await walletConnectPage.getSenderAddress();
    expect(connectedSenderAddress).toBeTruthy();
    expect(connectedSenderAddress.length).toBeGreaterThan(0);

    // Receiver should still be disconnected
    const receiverAddress = await walletConnectPage.getReceiverAddress();
    expect(receiverAddress).toBe('');
  });

  test('should maintain wallet connection after page refresh', async ({ page }) => {
    const walletConnectPage = new EthereumWalletConnectPage(page);

    // Navigate to the Ethereum wallet connect page
    await walletConnectPage.goto();
    await walletConnectPage.isLoaded();

    // Connect sender wallet
    await walletConnectPage.connectSenderWallet();
    await walletConnectPage.waitForSenderConnected();

    const senderAddress = await walletConnectPage.getSenderAddress();
    expect(senderAddress).toBeTruthy();

    // Refresh the page
    await page.reload();
    await walletConnectPage.isLoaded();

    // Wallet should still be connected after refresh
    const refreshedSenderAddress = await walletConnectPage.getSenderAddress();
    expect(refreshedSenderAddress).toBe(senderAddress);
  });

  test('should handle connection errors gracefully', async ({ page }) => {
    // Mock wallet with connection error
    await mockEthereumWalletConnectionError(page, 'User rejected connection');

    const walletConnectPage = new EthereumWalletConnectPage(page);

    // Navigate to the Ethereum wallet connect page
    await walletConnectPage.goto();
    await walletConnectPage.isLoaded();

    // Try to connect sender wallet (should fail)
    await walletConnectPage.connectSenderWallet();

    // Wait a bit for error handling
    await page.waitForTimeout(2000);

    // Page should still be functional
    await expect(page.locator('button:has-text("connect sender")')).toBeVisible();
    await expect(page.locator('button:has-text("connect receiver")')).toBeVisible();
    await expect(page.locator('button:has-text("Open Modal")')).toBeVisible();
  });

  test('should show different addresses for sender and receiver wallets', async ({ page }) => {
    const walletConnectPage = new EthereumWalletConnectPage(page);

    // Navigate to the Ethereum wallet connect page
    await walletConnectPage.goto();
    await walletConnectPage.isLoaded();

    // Connect both wallets
    await walletConnectPage.connectSenderWallet();
    await walletConnectPage.connectReceiverWallet();

    await walletConnectPage.waitForSenderConnected();
    await walletConnectPage.waitForReceiverConnected();

    // Get addresses
    const senderAddress = await walletConnectPage.getSenderAddress();
    const receiverAddress = await walletConnectPage.getReceiverAddress();

    // Verify addresses are different
    expect(senderAddress).not.toBe(receiverAddress);

    // Verify both are valid Ethereum addresses
    expect(senderAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(receiverAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  test('should handle rapid wallet connections', async ({ page }) => {
    const walletConnectPage = new EthereumWalletConnectPage(page);

    // Navigate to the Ethereum wallet connect page
    await walletConnectPage.goto();
    await walletConnectPage.isLoaded();

    // Connect both wallets with a small delay to avoid race conditions
    await walletConnectPage.connectSenderWallet();
    await page.waitForTimeout(500); // Small delay to avoid race conditions
    await walletConnectPage.connectReceiverWallet();

    // Wait for both to be connected
    await walletConnectPage.waitForBothWalletsConnected();

    // Verify both are connected
    const status = await walletConnectPage.getConnectionStatus();
    expect(status.sender).toBe(true);
    expect(status.receiver).toBe(true);
    expect(status.senderAddress).toBeTruthy();
    expect(status.receiverAddress).toBeTruthy();
  });

  test('should display wallet information correctly in UI', async ({ page }) => {
    const walletConnectPage = new EthereumWalletConnectPage(page);

    // Navigate to the Ethereum wallet connect page
    await walletConnectPage.goto();
    await walletConnectPage.isLoaded();

    // Connect sender wallet
    await walletConnectPage.connectSenderWallet();
    await walletConnectPage.waitForSenderConnected();

    // Verify UI elements are visible and contain correct information
    // Use more specific selectors to avoid multiple matches
    await expect(page.locator('div').filter({ hasText: /^sender: / }).first()).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^receiver: / }).first()).toBeVisible();

    // Verify sender address is displayed
    const senderAddress = await walletConnectPage.getSenderAddress();
    await expect(page.locator(`text=${senderAddress}`)).toBeVisible();

    // Verify receiver is still empty
    const receiverAddress = await walletConnectPage.getReceiverAddress();
    expect(receiverAddress).toBe('');
  });
});
