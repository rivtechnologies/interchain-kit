import { Page } from '@playwright/test';

declare global {
  interface Window {
    ethereum?: any;
    mockEthereumWallet?: any;
  }
}

export async function mockEthereumWallet(page: Page) {
  await page.addInitScript(() => {
    // Mock Ethereum provider
    window.ethereum = {
      isMetaMask: true,
      isConnected: () => true,
      request: async ({ method, params }: { method: string; params?: any[] }) => {
        console.log(`Ethereum request: ${method}`, params);
        
        switch (method) {
        case 'eth_requestAccounts':
          // Return mock Ethereum addresses
          return [
            '0x1234567890abcdef1234567890abcdef12345678', // Sender address
            '0xabcdef1234567890abcdef1234567890abcdef12'  // Receiver address
          ];
          
        case 'eth_accounts':
          // Return currently connected accounts
          return [
            '0x1234567890abcdef1234567890abcdef12345678',
            '0xabcdef1234567890abcdef1234567890abcdef12'
          ];
          
        case 'eth_chainId':
          // Return Sepolia testnet chain ID
          return '0xaa36a7'; // 11155111 in hex (Sepolia)
          
        case 'eth_getBalance':
          // Return mock balance
          return '0x2386f26fc10000'; // 10 ETH in wei (hex)
          
        case 'personal_sign':
          // Mock personal signature
          return '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
          
        case 'eth_signTypedData_v4':
          // Mock typed data signature
          return '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
          
        case 'wallet_switchEthereumChain':
          // Mock chain switching
          return null;
          
        case 'wallet_addEthereumChain':
          // Mock adding new chain
          return null;
          
        default:
          console.warn(`Unhandled Ethereum method: ${method}`);
          throw new Error(`Method ${method} not supported`);
        }
      },
      
      // Event emitter methods
      on: (eventName: string, callback: Function) => {
        console.log(`Ethereum event listener added: ${eventName}`);
      },
      
      removeListener: (eventName: string, callback: Function) => {
        console.log(`Ethereum event listener removed: ${eventName}`);
      },
      
      removeAllListeners: (eventName: string) => {
        console.log(`Ethereum event listeners removed: ${eventName}`);
      }
    };

    // Mock wallet objects for the specific wallet implementations
    window.mockEthereumWallet = {
      // Mock wallet sender
      mockEthereumWalletSender: {
        info: {
          name: 'Mock Ethereum Sender',
          icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMiA3TDEyIDEyTDIyIDdMMTIgMloiIGZpbGw9IiM2NjY2NjYiLz4KPHBhdGggZD0iTTIgMTdMMTIgMjJMMjIgMTdMMTIgMTJMMiAxN1oiIGZpbGw9IiM5OTk5OTkiLz4KPHBhdGggZD0iTTIgMTJMMTIgMTdMMjIgMTJMMTIgN0wyIDEyWiIgZmlsbD0iIzMzMzMzMyIvPgo8L3N2Zz4K',
          description: 'Mock Ethereum Sender Wallet for testing'
        },
        connect: async () => {
          console.log('Mock Ethereum Sender Wallet connected');
          return {
            address: '0x1234567890abcdef1234567890abcdef12345678',
            chainId: '0xaa36a7'
          };
        },
        disconnect: async () => {
          console.log('Mock Ethereum Sender Wallet disconnected');
        },
        getAccount: async () => {
          return {
            address: '0x1234567890abcdef1234567890abcdef12345678',
            chainId: '0xaa36a7'
          };
        }
      },

      // Mock wallet receiver
      mockEthereumWalletReceiver: {
        info: {
          name: 'Mock Ethereum Receiver',
          icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMiA3TDEyIDEyTDIyIDdMMTIgMloiIGZpbGw9IiM2NjY2NjYiLz4KPHBhdGggZD0iTTIgMTdMMTIgMjJMMjIgMTdMMTIgMTJMMiAxN1oiIGZpbGw9IiM5OTk5OTkiLz4KPHBhdGggZD0iTTIgMTJMMTIgMTdMMjIgMTJMMTIgN0wyIDEyWiIgZmlsbD0iIzMzMzMzMyIvPgo8L3N2Zz4K',
          description: 'Mock Ethereum Receiver Wallet for testing'
        },
        connect: async () => {
          console.log('Mock Ethereum Receiver Wallet connected');
          return {
            address: '0xabcdef1234567890abcdef1234567890abcdef12',
            chainId: '0xaa36a7'
          };
        },
        disconnect: async () => {
          console.log('Mock Ethereum Receiver Wallet disconnected');
        },
        getAccount: async () => {
          return {
            address: '0xabcdef1234567890abcdef1234567890abcdef12',
            chainId: '0xaa36a7'
          };
        }
      }
    };

    // Mock the specific wallet functions used in the page
    if (typeof window !== 'undefined') {
      // Mock the wallet functions that are imported in the page
      (window as any).mockEthereumWalletSender = window.mockEthereumWallet.mockEthereumWalletSender;
      (window as any).mockEthereumWalletReceiver = window.mockEthereumWallet.mockEthereumWalletReceiver;
    }

    console.log('Ethereum wallet mock initialized');
  });
}

// Additional mock for specific wallet behaviors
export async function mockEthereumWalletWithCustomAddresses(page: Page, senderAddress: string, receiverAddress: string) {
  await page.addInitScript((senderAddr: string, receiverAddr: string) => {
    if (window.ethereum) {
      const originalRequest = window.ethereum.request;
      window.ethereum.request = async ({ method, params }: { method: string; params?: any[] }) => {
        if (method === 'eth_requestAccounts') {
          return [senderAddr, receiverAddr];
        }
        if (method === 'eth_accounts') {
          return [senderAddr, receiverAddr];
        }
        return originalRequest({ method, params });
      };
    }
  }, senderAddress, receiverAddress);
}

// Mock for wallet connection errors
export async function mockEthereumWalletConnectionError(page: Page, errorMessage: string = 'User rejected connection') {
  await page.addInitScript((errorMsg: string) => {
    if (window.ethereum) {
      const originalRequest = window.ethereum.request;
      window.ethereum.request = async ({ method, params }: { method: string; params?: any[] }) => {
        if (method === 'eth_requestAccounts') {
          throw new Error(errorMsg);
        }
        return originalRequest({ method, params });
      };
    }
  }, errorMessage);
}
