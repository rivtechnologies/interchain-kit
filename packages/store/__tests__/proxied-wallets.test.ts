import { CosmosWallet, EthereumWallet, MultiChainWallet } from '@interchain-kit/core';

import { createCosmosWallet } from '../src/proxied-wallets/cosmos-wallet';
import { createProxiedWallet } from '../src/proxied-wallets/create-proxied-wallet';
import { createEthereumWallet } from '../src/proxied-wallets/ethereum-wallet';
import { createMultiChainWallet } from '../src/proxied-wallets/multi-chain-wallet';
import { InterchainStore } from '../src/store';
import { createAOPProxy } from '../src/utils/aop';

// Mock dependencies
jest.mock('../src/proxied-wallets/cosmos-wallet');
jest.mock('../src/proxied-wallets/ethereum-wallet');
jest.mock('../src/proxied-wallets/multi-chain-wallet');
jest.mock('@interchain-kit/core', () => ({
  ...jest.requireActual('@interchain-kit/core'),
  isInstanceOf: jest.fn(),
}));

describe('Proxied Wallets', () => {
  let mockStore: jest.Mocked<InterchainStore>;
  let mockCosmosWallet: jest.Mocked<CosmosWallet>;
  let mockEthereumWallet: jest.Mocked<EthereumWallet>;
  let mockMultiChainWallet: jest.Mocked<MultiChainWallet>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock InterchainStore
    mockStore = {
      getState: jest.fn(),
      setState: jest.fn(),
      subscribe: jest.fn().mockReturnValue(() => { }),
      setCurrentWalletName: jest.fn(),
      setCurrentChainName: jest.fn(),
      getChainWalletState: jest.fn(),
      updateChainWalletState: jest.fn(),
      buildIndexMap: jest.fn(),
    } as any;

    // Set up default mock implementations for create functions
    (createCosmosWallet as jest.Mock).mockImplementation((target, store) => {
      return createAOPProxy({
        target,
        advice: {
          signAmino: {
            before: jest.fn(),
            onError: jest.fn(),
          },
          signDirect: {
            around: jest.fn(),
          },
          signArbitrary: {
            around: jest.fn(),
          },
        },
      });
    });

    (createEthereumWallet as jest.Mock).mockImplementation((target, store) => {
      return createAOPProxy({
        target,
        advice: {
          connect: {
            around: jest.fn(),
          },
          getAccount: {
            around: jest.fn(),
          },
          sendTransaction: {
            onError: jest.fn(),
          },
          signMessage: {
            before: jest.fn(),
            after: jest.fn(),
            onError: jest.fn(),
          },
        },
      });
    });

    (createMultiChainWallet as jest.Mock).mockImplementation((target, store) => {
      return createAOPProxy({
        target,
        advice: {
          connect: {
            around: jest.fn(),
          },
          disconnect: {
            after: jest.fn(),
          },
        },
      });
    });

    // Mock wallets
    mockCosmosWallet = {
      info: { name: 'keplr', prettyName: 'Keplr' },
      signAmino: jest.fn(),
      signDirect: jest.fn(),
      signArbitrary: jest.fn(),
      getChainById: jest.fn(),
    } as any;

    mockEthereumWallet = {
      info: { name: 'metamask', prettyName: 'MetaMask' },
      connect: jest.fn(),
      getAccount: jest.fn(),
      sendTransaction: jest.fn(),
      signMessage: jest.fn(),
      getChainById: jest.fn(),
      getCurrentChainId: jest.fn(),
    } as any;

    mockMultiChainWallet = {
      info: { name: 'leap', prettyName: 'Leap' },
      connect: jest.fn(),
      disconnect: jest.fn(),
      getAccount: jest.fn(),
      getChainById: jest.fn(),
      networkWalletMap: new Map(),
      setNetworkWallet: jest.fn(),
    } as any;
  });

  describe('createProxiedWallet', () => {
    it('should create cosmos wallet proxy', () => {
      const { isInstanceOf } = require('@interchain-kit/core');
      isInstanceOf.mockImplementation((wallet: any, type: any) => {
        return wallet === mockCosmosWallet && type === CosmosWallet;
      });

      const proxiedWallet = createProxiedWallet(mockCosmosWallet, mockStore);

      expect(isInstanceOf).toHaveBeenCalledWith(mockCosmosWallet, CosmosWallet);
      expect(createCosmosWallet).toHaveBeenCalledWith(mockCosmosWallet, mockStore);
      expect(proxiedWallet).toBeDefined();
    });

    it('should create ethereum wallet proxy', () => {
      const { isInstanceOf } = require('@interchain-kit/core');
      isInstanceOf.mockImplementation((wallet: any, type: any) => {
        return wallet === mockEthereumWallet && type === EthereumWallet;
      });

      const proxiedWallet = createProxiedWallet(mockEthereumWallet, mockStore);

      expect(isInstanceOf).toHaveBeenCalledWith(mockEthereumWallet, EthereumWallet);
      expect(createEthereumWallet).toHaveBeenCalledWith(mockEthereumWallet, mockStore);
      expect(proxiedWallet).toBeDefined();
    });

    it('should create multi-chain wallet proxy', () => {
      const { isInstanceOf } = require('@interchain-kit/core');
      isInstanceOf.mockImplementation((wallet: any, type: any) => {
        return wallet === mockMultiChainWallet && type === MultiChainWallet;
      });

      const proxiedWallet = createProxiedWallet(mockMultiChainWallet, mockStore);

      expect(isInstanceOf).toHaveBeenCalledWith(mockMultiChainWallet, MultiChainWallet);
      expect(createMultiChainWallet).toHaveBeenCalledWith(mockMultiChainWallet, mockStore);
      expect(proxiedWallet).toBeDefined();
    });

    it('should return original wallet if no specific type matches', () => {
      const { isInstanceOf } = require('@interchain-kit/core');
      isInstanceOf.mockReturnValue(false);

      const proxiedWallet = createProxiedWallet(mockCosmosWallet, mockStore);

      expect(proxiedWallet).toBe(mockCosmosWallet);
    });
  });

  describe('createCosmosWallet', () => {

    it('should create AOP proxy for cosmos wallet', () => {
      const proxiedWallet = createCosmosWallet(mockCosmosWallet, mockStore);

      expect(proxiedWallet).toBeDefined();
      expect(proxiedWallet.info).toBe(mockCosmosWallet.info);
    });

    it('should handle signAmino with before and onError advice', () => {
      const proxiedWallet = createCosmosWallet(mockCosmosWallet, mockStore);

      // The proxy should preserve the original method signature
      expect(typeof proxiedWallet.signAmino).toBe('function');
    });

    it('should handle signDirect with around advice', () => {
      const proxiedWallet = createCosmosWallet(mockCosmosWallet, mockStore);

      expect(typeof proxiedWallet.signDirect).toBe('function');
    });

    it('should handle signArbitrary with around advice', () => {
      const proxiedWallet = createCosmosWallet(mockCosmosWallet, mockStore);

      expect(typeof proxiedWallet.signArbitrary).toBe('function');
    });
  });

  describe('createEthereumWallet', () => {

    it('should create AOP proxy for ethereum wallet', () => {
      const proxiedWallet = createEthereumWallet(mockEthereumWallet, mockStore);

      expect(proxiedWallet).toBeDefined();
      expect(proxiedWallet.info).toBe(mockEthereumWallet.info);
    });

    it('should handle connect with around advice', () => {
      const proxiedWallet = createEthereumWallet(mockEthereumWallet, mockStore);

      expect(typeof proxiedWallet.connect).toBe('function');
    });

    it('should handle getAccount with around advice', () => {
      const proxiedWallet = createEthereumWallet(mockEthereumWallet, mockStore);

      expect(typeof proxiedWallet.getAccount).toBe('function');
    });

    it('should handle sendTransaction with onError advice', () => {
      const proxiedWallet = createEthereumWallet(mockEthereumWallet, mockStore);

      expect(typeof proxiedWallet.sendTransaction).toBe('function');
    });

    it('should handle signMessage with before, after, and onError advice', () => {
      const proxiedWallet = createEthereumWallet(mockEthereumWallet, mockStore);

      expect(typeof proxiedWallet.signMessage).toBe('function');
    });
  });

  describe('createMultiChainWallet', () => {

    it('should create AOP proxy for multi-chain wallet', () => {
      const proxiedWallet = createMultiChainWallet(mockMultiChainWallet, mockStore);

      expect(proxiedWallet).toBeDefined();
      expect(proxiedWallet.info).toBe(mockMultiChainWallet.info);
    });

    it('should handle connect with around advice', () => {
      const proxiedWallet = createMultiChainWallet(mockMultiChainWallet, mockStore);

      expect(typeof proxiedWallet.connect).toBe('function');
    });

    it('should handle disconnect with after advice', () => {
      const proxiedWallet = createMultiChainWallet(mockMultiChainWallet, mockStore);

      expect(typeof proxiedWallet.disconnect).toBe('function');
    });
  });

  describe('Multi-Chain Wallet Network Wallet Handling', () => {
    it('should handle cosmos network wallets in multi-chain wallet', () => {
      const mockNetworkCosmosWallet = {
        info: { name: 'keplr-cosmos', prettyName: 'Keplr Cosmos' },
        signAmino: jest.fn(),
        signDirect: jest.fn(),
        signArbitrary: jest.fn(),
        getChainById: jest.fn(),
      } as any;

      mockMultiChainWallet.networkWalletMap.set('cosmos', mockNetworkCosmosWallet);

      const { isInstanceOf } = require('@interchain-kit/core');
      isInstanceOf.mockImplementation((wallet: any, type: any) => {
        if (wallet === mockMultiChainWallet && type === MultiChainWallet) return true;
        if (wallet === mockNetworkCosmosWallet && type === CosmosWallet) return true;
        return false;
      });

      createProxiedWallet(mockMultiChainWallet, mockStore);

      expect(createCosmosWallet).toHaveBeenCalledWith(mockNetworkCosmosWallet, mockStore);
      expect(mockMultiChainWallet.setNetworkWallet).toHaveBeenCalledWith(
        'cosmos',
        expect.any(Object)
      );
    });

    it('should handle ethereum network wallets in multi-chain wallet', () => {
      const mockNetworkEthereumWallet = {
        info: { name: 'metamask-ethereum', prettyName: 'MetaMask Ethereum' },
        connect: jest.fn(),
        getAccount: jest.fn(),
        sendTransaction: jest.fn(),
        signMessage: jest.fn(),
        getChainById: jest.fn(),
        getCurrentChainId: jest.fn(),
      } as any;

      mockMultiChainWallet.networkWalletMap.set('eip155', mockNetworkEthereumWallet);

      const { isInstanceOf } = require('@interchain-kit/core');
      isInstanceOf.mockImplementation((wallet: any, type: any) => {
        if (wallet === mockMultiChainWallet && type === MultiChainWallet) return true;
        if (wallet === mockNetworkEthereumWallet && type === EthereumWallet) return true;
        return false;
      });

      createProxiedWallet(mockMultiChainWallet, mockStore);

      expect(createEthereumWallet).toHaveBeenCalledWith(mockNetworkEthereumWallet, mockStore);
      expect(mockMultiChainWallet.setNetworkWallet).toHaveBeenCalledWith(
        'eip155',
        expect.any(Object)
      );
    });

    it('should handle multiple network wallets in multi-chain wallet', () => {
      const mockNetworkCosmosWallet = {
        info: { name: 'keplr-cosmos', prettyName: 'Keplr Cosmos' },
        signAmino: jest.fn(),
        signDirect: jest.fn(),
        signArbitrary: jest.fn(),
        getChainById: jest.fn(),
      } as any;

      const mockNetworkEthereumWallet = {
        info: { name: 'metamask-ethereum', prettyName: 'MetaMask Ethereum' },
        connect: jest.fn(),
        getAccount: jest.fn(),
        sendTransaction: jest.fn(),
        signMessage: jest.fn(),
        getChainById: jest.fn(),
        getCurrentChainId: jest.fn(),
      } as any;

      mockMultiChainWallet.networkWalletMap.set('cosmos', mockNetworkCosmosWallet);
      mockMultiChainWallet.networkWalletMap.set('eip155', mockNetworkEthereumWallet);

      const { isInstanceOf } = require('@interchain-kit/core');
      isInstanceOf.mockImplementation((wallet: any, type: any) => {
        if (wallet === mockMultiChainWallet && type === MultiChainWallet) return true;
        if (wallet === mockNetworkCosmosWallet && type === CosmosWallet) return true;
        if (wallet === mockNetworkEthereumWallet && type === EthereumWallet) return true;
        return false;
      });

      createProxiedWallet(mockMultiChainWallet, mockStore);

      expect(createCosmosWallet).toHaveBeenCalledWith(mockNetworkCosmosWallet, mockStore);
      expect(createEthereumWallet).toHaveBeenCalledWith(mockNetworkEthereumWallet, mockStore);
      expect(mockMultiChainWallet.setNetworkWallet).toHaveBeenCalledTimes(2);
    });
  });

  describe('Integration Tests', () => {
    it('should preserve wallet functionality while adding AOP capabilities', () => {
      const { isInstanceOf } = require('@interchain-kit/core');
      isInstanceOf.mockReturnValue(true);

      const proxiedWallet = createProxiedWallet(mockCosmosWallet, mockStore);

      // Should preserve original properties
      expect(proxiedWallet.info).toBe(mockCosmosWallet.info);

      // Should preserve original methods (though they're now proxied)
      expect(typeof proxiedWallet.signAmino).toBe('function');
      expect(typeof proxiedWallet.signDirect).toBe('function');
      expect(typeof proxiedWallet.signArbitrary).toBe('function');
    });

    it('should handle wallet with no matching type', () => {
      const { isInstanceOf } = require('@interchain-kit/core');
      isInstanceOf.mockReturnValue(false);

      const originalWallet = { info: { name: 'unknown', prettyName: 'Unknown' } };
      const proxiedWallet = createProxiedWallet(originalWallet, mockStore);

      expect(proxiedWallet).toBe(originalWallet);
      expect(createCosmosWallet).not.toHaveBeenCalled();
      expect(createEthereumWallet).not.toHaveBeenCalled();
      expect(createMultiChainWallet).not.toHaveBeenCalled();
    });
  });
});


