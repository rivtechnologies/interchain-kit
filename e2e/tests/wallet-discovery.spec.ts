
import { WalletState } from '@interchain-kit/core';
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

import { WalletModalModel } from './page-models/wallet-modal';
import { WalletConnectPage } from './page-models/wallet-connect';
import { mockWalletWindowObject } from './utils/mock-wallet';

test.describe('Wallet Discovery & Connection', () => {





  test.beforeEach(async ({ page, context }) => {

    // Navigate to the application
    // await page.goto('/');
  })


  test('should be disconnected when init, if wallet exist', async ({ page }) => {
    await mockWalletWindowObject(page)
    await page.goto('/wallet-connect');
    const element = await page.locator('#wallet-state');
    await expect(element).toContainText(WalletState.Disconnected);
  });

  test('should show connected, after connect wallet', async ({ page }) => {
    await mockWalletWindowObject(page)
    await page.goto('/wallet-connect');
    const connectBtn = page.locator('[data-testid="connect-wallet-btn"]');
    await connectBtn.click();
    const element = await page.locator('#wallet-state');
    await expect(element).toContainText(WalletState.Connected);
  });

  test('can open modal', async ({ page }) => {
    await mockWalletWindowObject(page)
    await page.goto('/wallet-connect');
    const walletModal = new WalletModalModel(page);
    await page.locator('[data-testid="open-modal-btn"]').click();
    await walletModal.isOpen()
  })

  test('should show disconnected, after disconnect wallet', async ({ page }) => {
    await mockWalletWindowObject(page)
    await page.goto('/wallet-connect');
    const connectBtn = page.locator('[data-testid="connect-wallet-btn"]');
    await connectBtn.click();
    const disconnectBtn = page.locator('[data-testid="disconnect-wallet-btn"]');
    await disconnectBtn.click();
    const element = await page.locator('#wallet-state');
    await expect(element).toContainText(WalletState.Disconnected);
  });

  test('should show address, after connect wallet', async ({ page }) => {
    const address = 'osmo1m3a…v54ywaw';
    await mockWalletWindowObject(page);
    await page.goto('/wallet-connect');
    const walletConnectPage = new WalletConnectPage(page);
    await walletConnectPage.connect();
    await walletConnectPage.isConnected();
    await walletConnectPage.openModal();
    const walletModal = new WalletModalModel(page);
    await walletModal.isOpen();
    expect(page.locator(`text='${address}'`)).toBeVisible();
  })

  test('disconnect from wallet modal', async ({ page }) => {
    await mockWalletWindowObject(page);
    await page.goto('/wallet-connect');
    const walletConnectPage = new WalletConnectPage(page);
    await walletConnectPage.connect();
    await walletConnectPage.isConnected();
    await walletConnectPage.openModal();
    const walletModalModel = new WalletModalModel(page);
    await walletModalModel.isOpen();
    await walletModalModel.disconnectWallet('Mock Wallet');
    await walletConnectPage.isDisconnected();
  })

  test('should show install instructions, if wallet not exist', async ({ page }) => {
    await page.goto('/wallet-connect');
    const walletConnectPage = new WalletConnectPage(page);
    await walletConnectPage.openModal();
    const walletModal = new WalletModalModel(page);
    await walletModal.connectWallet('Not Installed Wallet');
    await walletModal.isNotExistWalletVisible('Not Installed Wallet');

  })

});
