import { Algo, WalletAccount, WalletState } from '@interchain-kit/core';

import { ChainWalletState, InterchainStoreType } from '../src/types';

describe('Type Definitions', () => {
  describe('ChainWalletState', () => {
    it('should have correct structure', () => {
      const chainWalletState: ChainWalletState = {
        chainName: 'cosmoshub',
        walletName: 'keplr',
        walletState: WalletState.Connected,
        rpcEndpoint: 'https://rpc.cosmos.network',
        errorMessage: '',
        account: {
          address: 'cosmos1abc123',
          pubkey: new Uint8Array([1, 2, 3]),
          isNanoLedger: false,
          algo: 'secp256k1' as Algo,
        },
      };

      expect(chainWalletState.chainName).toBe('cosmoshub');
      expect(chainWalletState.walletName).toBe('keplr');
      expect(chainWalletState.walletState).toBe(WalletState.Connected);
      expect(chainWalletState.rpcEndpoint).toBe('https://rpc.cosmos.network');
      expect(chainWalletState.errorMessage).toBe('');
      expect(chainWalletState.account).toBeDefined();
    });

    it('should allow undefined account', () => {
      const chainWalletState: ChainWalletState = {
        chainName: 'cosmoshub',
        walletName: 'keplr',
        walletState: WalletState.Disconnected,
        rpcEndpoint: '',
        errorMessage: '',
        account: undefined,
      };

      expect(chainWalletState.account).toBeUndefined();
    });

    it('should handle different wallet states', () => {
      const states = [
        WalletState.Connected,
        WalletState.Connecting,
        WalletState.Disconnected,
        WalletState.NotExist,
        WalletState.Rejected,
      ];

      states.forEach(state => {
        const chainWalletState: ChainWalletState = {
          chainName: 'cosmoshub',
          walletName: 'keplr',
          walletState: state,
          rpcEndpoint: '',
          errorMessage: '',
          account: undefined,
        };

        expect(chainWalletState.walletState).toBe(state);
      });
    });

    it('should handle error messages', () => {
      const chainWalletState: ChainWalletState = {
        chainName: 'cosmoshub',
        walletName: 'keplr',
        walletState: WalletState.Disconnected,
        rpcEndpoint: '',
        errorMessage: 'Connection failed: User rejected',
        account: undefined,
      };

      expect(chainWalletState.errorMessage).toBe('Connection failed: User rejected');
    });

    it('should handle different chain names', () => {
      const chainNames = ['cosmoshub', 'osmosis', 'juno', 'akash', 'regen'];

      chainNames.forEach(chainName => {
        const chainWalletState: ChainWalletState = {
          chainName,
          walletName: 'keplr',
          walletState: WalletState.Connected,
          rpcEndpoint: `https://rpc.${chainName}.network`,
          errorMessage: '',
          account: undefined,
        };

        expect(chainWalletState.chainName).toBe(chainName);
      });
    });

    it('should handle different wallet names', () => {
      const walletNames = ['keplr', 'leap', 'cosmostation', 'metamask', 'phantom'];

      walletNames.forEach(walletName => {
        const chainWalletState: ChainWalletState = {
          chainName: 'cosmoshub',
          walletName,
          walletState: WalletState.Connected,
          rpcEndpoint: 'https://rpc.cosmos.network',
          errorMessage: '',
          account: undefined,
        };

        expect(chainWalletState.walletName).toBe(walletName);
      });
    });
  });

  describe('InterchainStoreType', () => {
    it('should have correct structure', () => {
      const storeState: InterchainStoreType = {
        currentWalletName: 'keplr',
        currentChainName: 'cosmoshub',
        chainWalletStates: [
          {
            chainName: 'cosmoshub',
            walletName: 'keplr',
            walletState: WalletState.Connected,
            rpcEndpoint: 'https://rpc.cosmos.network',
            errorMessage: '',
            account: {
              address: 'cosmos1abc123',
              pubkey: new Uint8Array([1, 2, 3]),
              isNanoLedger: false,
              algo: 'secp256k1' as Algo,
            },
          },
        ],
        isReady: true,
        modalIsOpen: false,
        walletConnectQRCodeUri: 'wc:abc123',
      };

      expect(storeState.currentWalletName).toBe('keplr');
      expect(storeState.currentChainName).toBe('cosmoshub');
      expect(storeState.chainWalletStates).toHaveLength(1);
      expect(storeState.isReady).toBe(true);
      expect(storeState.modalIsOpen).toBe(false);
      expect(storeState.walletConnectQRCodeUri).toBe('wc:abc123');
    });

    it('should allow empty state', () => {
      const storeState: InterchainStoreType = {
        currentWalletName: '',
        currentChainName: '',
        chainWalletStates: [],
        isReady: false,
        modalIsOpen: false,
        walletConnectQRCodeUri: '',
      };

      expect(storeState.currentWalletName).toBe('');
      expect(storeState.currentChainName).toBe('');
      expect(storeState.chainWalletStates).toHaveLength(0);
      expect(storeState.isReady).toBe(false);
      expect(storeState.modalIsOpen).toBe(false);
      expect(storeState.walletConnectQRCodeUri).toBe('');
    });

    it('should handle multiple chain wallet states', () => {
      const storeState: InterchainStoreType = {
        currentWalletName: 'keplr',
        currentChainName: 'cosmoshub',
        chainWalletStates: [
          {
            chainName: 'cosmoshub',
            walletName: 'keplr',
            walletState: WalletState.Connected,
            rpcEndpoint: 'https://rpc.cosmos.network',
            errorMessage: '',
            account: {
              address: 'cosmos1abc123',
              pubkey: new Uint8Array([1, 2, 3]),
              isNanoLedger: false,
              algo: 'secp256k1' as Algo,
            },
          },
          {
            chainName: 'osmosis',
            walletName: 'keplr',
            walletState: WalletState.Connecting,
            rpcEndpoint: 'https://rpc.osmosis.zone',
            errorMessage: '',
            account: undefined,
          },
          {
            chainName: 'juno',
            walletName: 'leap',
            walletState: WalletState.Disconnected,
            rpcEndpoint: 'https://rpc.juno.network',
            errorMessage: 'Connection failed',
            account: undefined,
          },
        ],
        isReady: true,
        modalIsOpen: true,
        walletConnectQRCodeUri: 'wc:def456',
      };

      expect(storeState.chainWalletStates).toHaveLength(3);
      expect(storeState.modalIsOpen).toBe(true);
    });

    it('should handle different boolean states', () => {
      const readyStates = [true, false];
      const modalStates = [true, false];

      readyStates.forEach(isReady => {
        modalStates.forEach(modalIsOpen => {
          const storeState: InterchainStoreType = {
            currentWalletName: 'keplr',
            currentChainName: 'cosmoshub',
            chainWalletStates: [],
            isReady,
            modalIsOpen,
            walletConnectQRCodeUri: '',
          };

          expect(storeState.isReady).toBe(isReady);
          expect(storeState.modalIsOpen).toBe(modalIsOpen);
        });
      });
    });

    it('should handle WalletConnect QR code URIs', () => {
      const qrCodeUris = [
        '',
        'wc:abc123',
        'wc:def456@2?relay-protocol=irn&symKey=xyz789',
        'wc:ghi012@1?bridge=https%3A%2F%2Fbridge.walletconnect.org&key=abc123',
      ];

      qrCodeUris.forEach(uri => {
        const storeState: InterchainStoreType = {
          currentWalletName: 'keplr',
          currentChainName: 'cosmoshub',
          chainWalletStates: [],
          isReady: false,
          modalIsOpen: false,
          walletConnectQRCodeUri: uri,
        };

        expect(storeState.walletConnectQRCodeUri).toBe(uri);
      });
    });
  });

  describe('Type Compatibility', () => {
    it('should be compatible with WalletAccount from @interchain-kit/core', () => {
      const account: WalletAccount = {
        address: 'cosmos1abc123',
        pubkey: new Uint8Array([1, 2, 3]),
        isNanoLedger: false,
        algo: 'secp256k1' as Algo,
      };

      const chainWalletState: ChainWalletState = {
        chainName: 'cosmoshub',
        walletName: 'keplr',
        walletState: WalletState.Connected,
        rpcEndpoint: 'https://rpc.cosmos.network',
        errorMessage: '',
        account,
      };

      expect(chainWalletState.account).toBe(account);
    });

    it('should be compatible with WalletState from @interchain-kit/core', () => {
      const walletStates: WalletState[] = [
        WalletState.Connected,
        WalletState.Connecting,
        WalletState.Disconnected,
        WalletState.NotExist,
        WalletState.Rejected,
      ];

      walletStates.forEach(walletState => {
        const chainWalletState: ChainWalletState = {
          chainName: 'cosmoshub',
          walletName: 'keplr',
          walletState,
          rpcEndpoint: '',
          errorMessage: '',
          account: undefined,
        };

        expect(chainWalletState.walletState).toBe(walletState);
      });
    });
  });

  describe('Type Safety', () => {
    it('should enforce required properties', () => {
      // This test ensures TypeScript compilation would fail if required properties are missing
      const validChainWalletState: ChainWalletState = {
        chainName: 'cosmoshub',
        walletName: 'keplr',
        walletState: WalletState.Connected,
        rpcEndpoint: 'https://rpc.cosmos.network',
        errorMessage: '',
        account: undefined,
      };

      expect(validChainWalletState).toBeDefined();
    });

    it('should enforce required properties for InterchainStoreType', () => {
      const validStoreState: InterchainStoreType = {
        currentWalletName: 'keplr',
        currentChainName: 'cosmoshub',
        chainWalletStates: [],
        isReady: false,
        modalIsOpen: false,
        walletConnectQRCodeUri: '',
      };

      expect(validStoreState).toBeDefined();
    });

    it('should allow partial updates', () => {
      const partialUpdate: Partial<InterchainStoreType> = {
        currentWalletName: 'keplr',
        isReady: true,
      };

      expect(partialUpdate.currentWalletName).toBe('keplr');
      expect(partialUpdate.isReady).toBe(true);
      expect(partialUpdate.currentChainName).toBeUndefined();
    });

    it('should allow partial chain wallet state updates', () => {
      const partialUpdate: Partial<ChainWalletState> = {
        walletState: WalletState.Connected,
        account: {
          address: 'cosmos1abc123',
          pubkey: new Uint8Array([1, 2, 3]),
          isNanoLedger: false,
          algo: 'secp256k1' as Algo,
        },
      };

      expect(partialUpdate.walletState).toBe(WalletState.Connected);
      expect(partialUpdate.account).toBeDefined();
      expect(partialUpdate.chainName).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings', () => {
      const chainWalletState: ChainWalletState = {
        chainName: '',
        walletName: '',
        walletState: WalletState.Disconnected,
        rpcEndpoint: '',
        errorMessage: '',
        account: undefined,
      };

      expect(chainWalletState.chainName).toBe('');
      expect(chainWalletState.walletName).toBe('');
      expect(chainWalletState.rpcEndpoint).toBe('');
      expect(chainWalletState.errorMessage).toBe('');
    });

    it('should handle long error messages', () => {
      const longErrorMessage = 'This is a very long error message that might contain detailed information about what went wrong during the connection process and could potentially wrap to multiple lines in the UI.';

      const chainWalletState: ChainWalletState = {
        chainName: 'cosmoshub',
        walletName: 'keplr',
        walletState: WalletState.Disconnected,
        rpcEndpoint: '',
        errorMessage: longErrorMessage,
        account: undefined,
      };

      expect(chainWalletState.errorMessage).toBe(longErrorMessage);
    });

    it('should handle special characters in names', () => {
      const chainWalletState: ChainWalletState = {
        chainName: 'cosmos-hub-4',
        walletName: 'keplr-extension',
        walletState: WalletState.Connected,
        rpcEndpoint: 'https://rpc.cosmos-hub-4.network',
        errorMessage: '',
        account: undefined,
      };

      expect(chainWalletState.chainName).toBe('cosmos-hub-4');
      expect(chainWalletState.walletName).toBe('keplr-extension');
    });
  });
});
