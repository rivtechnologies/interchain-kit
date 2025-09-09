import { BrowserContext, expect,Page } from '@playwright/test';

/**
 * 常用測試工具函數
 */
export class TestUtils {
  /**
   * 連接 Mock 錢包
   * @param page Playwright Page 對象
   * @returns 是否成功連接
   */
  static async connectMockWallet(page: Page): Promise<boolean> {
    try {
      // 點擊連接按鈕
      const connectButton = page.getByRole('button', { name: /Connect/i });
      await connectButton.click();

      // 尋找並點擊 Mock 錢包選項
      const walletModal = page.locator('div[role="dialog"]');
      const mockWalletOption = walletModal.getByText(/Mock/, { exact: false });

      if (await mockWalletOption.isVisible()) {
        await mockWalletOption.click();

        // 等待連接完成
        await page.waitForTimeout(1000);

        // 檢查是否成功連接
        const disconnectButton = page.getByRole('button', { name: /Disconnect|Address/i });
        await expect(disconnectButton).toBeVisible({ timeout: 5000 });
        return true;
      }
      return false;
    } catch (error) {
      console.error('連接 Mock 錢包失敗:', error);
      return false;
    }
  }

  /**
   * 斷開連接錢包
   * @param page Playwright Page 對象
   * @returns 是否成功斷開連接
   */
  static async disconnectWallet(page: Page): Promise<boolean> {
    try {
      // 找尋斷開連接按鈕
      const disconnectButton = page.getByRole('button', { name: /Disconnect|斷開連接/i });

      if (await disconnectButton.isVisible()) {
        // 直接點擊斷開連接按鈕
        await disconnectButton.click();
      } else {
        // 如果沒有直接的斷開按鈕，可能需要先點擊地址或錢包按鈕
        // 尋找可能的錢包地址或賬戶按鈕
        const accountButtons = [
          page.getByText(/cosmos|osmo|terra|evmos|axl|sei/, { exact: false }),
          page.getByRole('button', { name: /Account|Wallet|帳戶|錢包/i }),
          page.getByRole('button').filter({ hasText: /cosmos|osmo|[a-z0-9]{6}\.{3}[a-z0-9]{6}/i })
        ];

        for (const button of accountButtons) {
          if (await button.isVisible()) {
            await button.click();

            // 在彈出的選單中尋找斷開連接選項
            const disconnectOption = page.getByRole('menuitem', { name: /Disconnect|斷開連接/i });
            if (await disconnectOption.isVisible()) {
              await disconnectOption.click();
              break;
            } else {
              // 如果沒有選單項，尋找斷開按鈕
              const dialogDisconnect = page.getByRole('button', { name: /Disconnect|斷開連接/i });
              if (await dialogDisconnect.isVisible()) {
                await dialogDisconnect.click();
                break;
              }
            }
          }
        }
      }

      // 驗證已斷開連接 - 應該再次顯示連接按鈕
      const connectButton = page.getByRole('button', { name: /Connect|連接錢包/i });
      await expect(connectButton).toBeVisible({ timeout: 5000 });
      return true;
    } catch (error) {
      console.error('斷開錢包連接失敗:', error);
      return false;
    }
  }

  /**
   * 獲取當前連接的錢包地址 (如果有顯示在界面上)
   */
  static async getConnectedAddress(page: Page): Promise<string | null> {
    try {
      const addressElement = page.getByText(/cosmos|osmo|terra|evmos|axl|sei/, { exact: false });
      if (await addressElement.isVisible()) {
        return await addressElement.textContent() || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * 設置模擬錢包所需的 localStorage
   */
  static async setupMockWalletStorage(context: BrowserContext) {
    await context.addInitScript(() => {
      const mockStorage = {
        'mock-wallet-enabled': 'true',
        'mock-wallet-address': 'cosmos1mock...'
      };

      for (const [key, value] of Object.entries(mockStorage)) {
        window.localStorage.setItem(key, value);
      }
    });
  }
}
