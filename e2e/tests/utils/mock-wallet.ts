import { Page } from "@playwright/test";

declare global {
  interface Window {
    mockcosmos1?: any;
    ethereum?: any;
    mockcosmos2?: any;
  }
}

export async function mockKeplrWallet(page: Page) {
  await page.addInitScript(() => {
    window.mockcosmos1 = {
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