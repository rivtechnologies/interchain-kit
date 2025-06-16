import { Page } from "@playwright/test";

declare global {
  interface Window {
    mockWallet?: any;
    ethereum?: any;
  }
}

export async function mockWalletWindowObject(page: Page) {
  await page.addInitScript(() => {
    window.mockWallet = {
      enable: async (chainId: string) => {
        // Mock enabling the wallet for a specific chain
        console.log(`Keplr enabled for chain: ${chainId}`);
        return Promise.resolve();
      },
      getKey: async (chainId: string) => {
        // Mock returning a key for the specified chain
        return {
          bech32Address: 'cosmos1xx',
          pubKey: new Uint8Array([1, 2, 3, 4]),
        };
      },
    };
    window.ethereum = {
      request: async ({ method, params }: { method: string; params?: any[] }) => {
        if (method === 'eth_requestAccounts') {
          return ['0x1234567890abcdef1234567890abcdef12345678'];
        }
        throw new Error('Method not supported');
      },
    };
  });


}

export async function mockLeapWallet(page: Page) {
  await page.addInitScript(() => {
    window.mockcosmos2 = {
      enable: async (chainId: string) => {
        // Mock enabling the wallet for a specific chain
        console.log(`Leap enabled for chain: ${chainId}`);
      },
      getKey: async (chainId: string) => {
        // Mock returning a key for the specified chain
        return {
          bech32Address: `leap1${chainId}`,
          pubKey: new Uint8Array([5, 6, 7, 8]),
        };
      },
    };
  });
} 