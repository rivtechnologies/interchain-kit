import { Chain } from '@chain-registry/types';
import { Algo, BaseWallet, WalletAccount, WalletManager, WalletState } from '@interchain-kit/core';

import { InterchainStore } from '../src/store';
import { ChainWalletStore } from '../src/wallet-manager/chain-wallet-store';
import { WalletStore } from '../src/wallet-manager/wallet-store';

// Mock dependencies
jest.mock('../src/wallet-manager/chain-wallet-store');

describe('WalletStore', () => {
  let walletStore: WalletStore;
  let mockWallet: BaseWallet;
  let mockChains: Chain[];
  let mockInterchainStore: jest.Mocked<InterchainStore>;
  let mockWalletManager: jest.Mocked<WalletManager>;
  let mockChainWalletStore: jest.Mocked<ChainWalletStore>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock wallet
    mockWallet = {
      info: { name: 'keplr', prettyName: 'Keplr' },
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      getAccount: jest.fn().mockResolvedValue({
        address: 'cosmos1abc123',
        pubkey: new Uint8Array([1, 2, 3]),
        isNanoLedger: false,
        algo: 'secp256k1' as Algo,
      }),
      addSuggestChain: jest.fn().mockResolvedValue(undefined),
      getProvider: jest.fn().mockResolvedValue({}),
      init: jest.fn().mockResolvedValue(undefined),
    } as any;

    // Mock chains
    mockChains = [
      {
        chainName: 'cosmoshub',
        chainId: 'cosmoshub-4',
        bech32Prefix: 'cosmos',
        chainType: 'cosmos',
        prettyName: 'Cosmos Hub',
        status: 'live',
        networkType: 'mainnet',
        slip44: 118,
        apis: {
          rpc: [{ address: 'https://rpc.cosmos.network' }],
          rest: [{ address: 'https://lcd.cosmos.network' }],
        },
      },
      {
        chainName: 'osmosis',
        chainId: 'osmosis-1',
        bech32Prefix: 'osmo',
        chainType: 'cosmos',
        prettyName: 'Osmosis',
        status: 'live',
        networkType: 'mainnet',
        slip44: 118,
        apis: {
          rpc: [{ address: 'https://rpc.osmosis.zone' }],
          rest: [{ address: 'https://lcd.osmosis.zone' }],
        },
      },
    ];

    // Mock InterchainStore
    mockInterchainStore = {
      getState: jest.fn().mockReturnValue({
        currentWalletName: '',
        currentChainName: '',
        chainWalletStates: [],
        isReady: false,
        modalIsOpen: false,
        walletConnectQRCodeUri: '',
      }),
      setState: jest.fn(),
      subscribe: jest.fn().mockReturnValue(() => { }),
      setCurrentWalletName: jest.fn(),
      setCurrentChainName: jest.fn(),
      getChainWalletState: jest.fn(),
      updateChainWalletState: jest.fn(),
      buildIndexMap: jest.fn(),
      isChainWalletStateExisted: jest.fn().mockReturnValue(false),
      updateWalletState: jest.fn(),
    } as any;

    // Mock WalletManager
    mockWalletManager = {
      getChainById: jest.fn().mockImplementation((chainId: string) => {
        return mockChains.find(chain => chain.chainId === chainId);
      }),
      getChainByName: jest.fn(),
      getAssetListByName: jest.fn(),
      getRpcEndpoint: jest.fn(),
      getPreferSignType: jest.fn(),
      getSignerOptions: jest.fn(),
      getEnv: jest.fn(),
      getDownloadLink: jest.fn(),
      signerOptions: {},
      endpointOptions: {},
      preferredSignTypeMap: {},
      signerOptionMap: {},
      endpointOptionsMap: {},
    } as any;

    // Mock ChainWalletStore
    mockChainWalletStore = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      getAccount: jest.fn(),
      addSuggestChain: jest.fn(),
      getProvider: jest.fn(),
      getOfflineSigner: jest.fn(),
      init: jest.fn().mockResolvedValue(undefined),
      walletState: WalletState.Disconnected,
      errorMessage: '',
      chains: mockChains,
    } as any;

    // Mock ChainWalletStore constructor
    (ChainWalletStore as jest.Mock).mockImplementation(() => mockChainWalletStore);

    walletStore = new WalletStore(mockWallet, mockChains, mockInterchainStore, mockWalletManager);
  });

  describe('Constructor', () => {
    it('should initialize with correct parameters', () => {
      expect(walletStore.info).toEqual(mockWallet.info);
      expect(walletStore.wallet).toBe(mockWallet);
      expect(walletStore.chains).toBe(mockChains);
      expect(walletStore.store).toBe(mockInterchainStore);
      expect(walletStore.walletManager).toBe(mockWalletManager);
    });

    it('should create chain wallet stores for each chain', () => {
      expect(ChainWalletStore).toHaveBeenCalledTimes(2);
      expect(ChainWalletStore).toHaveBeenCalledWith(
        mockWallet,
        mockChains[0],
        mockInterchainStore,
        mockWalletManager
      );
      expect(ChainWalletStore).toHaveBeenCalledWith(
        mockWallet,
        mockChains[1],
        mockInterchainStore,
        mockWalletManager
      );
    });

    it('should store chain wallet stores in map', () => {
      expect(walletStore.chainWalletStoreMap.size).toBe(2);
      expect(walletStore.chainWalletStoreMap.get('cosmoshub')).toBe(mockChainWalletStore);
      expect(walletStore.chainWalletStoreMap.get('osmosis')).toBe(mockChainWalletStore);
    });
  });

  describe('Wallet State', () => {
    it('should return Connected when any chain is connected', () => {
      mockInterchainStore.getState.mockReturnValue({
        chainWalletStates: [
          {
            walletName: 'keplr',
            chainName: 'cosmoshub',
            walletState: WalletState.Connected,
            rpcEndpoint: '',
            errorMessage: '',
            account: undefined,
          },
          {
            walletName: 'keplr',
            chainName: 'osmosis',
            walletState: WalletState.Disconnected,
            rpcEndpoint: '',
            errorMessage: '',
            account: undefined,
          },
        ],
      } as any);

      const walletState = walletStore.walletState;

      expect(walletState).toBe(WalletState.Connected);
    });

    it('should return Connecting when any chain is connecting', () => {
      mockInterchainStore.getState.mockReturnValue({
        chainWalletStates: [
          {
            walletName: 'keplr',
            chainName: 'cosmoshub',
            walletState: WalletState.Connecting,
            rpcEndpoint: '',
            errorMessage: '',
            account: undefined,
          },
          {
            walletName: 'keplr',
            chainName: 'osmosis',
            walletState: WalletState.Disconnected,
            rpcEndpoint: '',
            errorMessage: '',
            account: undefined,
          },
        ],
      } as any);

      const walletState = walletStore.walletState;

      expect(walletState).toBe(WalletState.Connecting);
    });

    it('should return Disconnected when all chains are disconnected', () => {
      mockInterchainStore.getState.mockReturnValue({
        chainWalletStates: [
          {
            walletName: 'keplr',
            chainName: 'cosmoshub',
            walletState: WalletState.Disconnected,
            rpcEndpoint: '',
            errorMessage: '',
            account: undefined,
          },
          {
            walletName: 'keplr',
            chainName: 'osmosis',
            walletState: WalletState.Disconnected,
            rpcEndpoint: '',
            errorMessage: '',
            account: undefined,
          },
        ],
      } as any);

      const walletState = walletStore.walletState;

      expect(walletState).toBe(WalletState.Disconnected);
    });

    it('should return Disconnected when no chain wallet states exist', () => {
      mockInterchainStore.getState.mockReturnValue({
        chainWalletStates: [],
      } as any);

      const walletState = walletStore.walletState;

      expect(walletState).toBe(WalletState.Disconnected);
    });

    it('should only consider states for this wallet', () => {
      mockInterchainStore.getState.mockReturnValue({
        chainWalletStates: [
          {
            walletName: 'leap',
            chainName: 'cosmoshub',
            walletState: WalletState.Connected,
            rpcEndpoint: '',
            errorMessage: '',
            account: undefined,
          },
          {
            walletName: 'keplr',
            chainName: 'osmosis',
            walletState: WalletState.Disconnected,
            rpcEndpoint: '',
            errorMessage: '',
            account: undefined,
          },
        ],
      } as any);

      const walletState = walletStore.walletState;

      expect(walletState).toBe(WalletState.Disconnected);
    });
  });

  describe('Error Message', () => {
    it('should return error message from first chain wallet state', () => {
      mockInterchainStore.getState.mockReturnValue({
        chainWalletStates: [
          {
            walletName: 'keplr',
            chainName: 'cosmoshub',
            walletState: WalletState.Disconnected,
            rpcEndpoint: '',
            errorMessage: 'Connection failed',
            account: undefined,
          },
          {
            walletName: 'keplr',
            chainName: 'osmosis',
            walletState: WalletState.Disconnected,
            rpcEndpoint: '',
            errorMessage: 'Another error',
            account: undefined,
          },
        ],
      } as any);

      const errorMessage = walletStore.errorMessage;

      expect(errorMessage).toBe('Connection failed');
    });

    it('should return empty string when no error message exists', () => {
      mockInterchainStore.getState.mockReturnValue({
        chainWalletStates: [
          {
            walletName: 'keplr',
            chainName: 'cosmoshub',
            walletState: WalletState.Connected,
            rpcEndpoint: '',
            errorMessage: '',
            account: undefined,
          },
        ],
      } as any);

      const errorMessage = walletStore.errorMessage;

      expect(errorMessage).toBe('');
    });

    it('should return empty string when no chain wallet states exist', () => {
      mockInterchainStore.getState.mockReturnValue({
        chainWalletStates: [],
      } as any);

      const errorMessage = walletStore.errorMessage;

      expect(errorMessage).toBe('');
    });
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await walletStore.init();

      expect(mockChainWalletStore.init).toHaveBeenCalledTimes(2);
      expect(mockWallet.init).toHaveBeenCalled();
    });

    it('should handle initialization errors', async () => {
      const error = new Error('Init failed');
      (mockWallet.init as jest.Mock).mockRejectedValue(error);

      await walletStore.init();

      expect(mockInterchainStore.updateWalletState).toHaveBeenCalledWith(
        'keplr',
        { walletState: WalletState.NotExist, errorMessage: 'Init failed' }
      );
    });
  });

  describe('Chain Wallet Store Management', () => {
    it('should get chain wallet store by name', () => {
      const chainWalletStore = walletStore.getChainWalletStore('cosmoshub');

      expect(chainWalletStore).toBe(mockChainWalletStore);
    });

    it('should throw error for non-existent chain wallet store', () => {
      expect(() => {
        walletStore.getChainWalletStore('non-existent');
      }).toThrow('Chain wallet store with chain name non-existent not found');
    });
  });

  describe('Wallet Operations', () => {
    beforeEach(() => {
      mockWalletManager.getChainById.mockImplementation((chainId: string) => {
        return mockChains.find(chain => chain.chainId === chainId);
      });
    });

    it('should connect to chain by chain ID', async () => {
      await walletStore.connect('cosmoshub-4');

      expect(mockWalletManager.getChainById).toHaveBeenCalledWith('cosmoshub-4');
      expect(mockChainWalletStore.connect).toHaveBeenCalled();
    });

    it('should disconnect from chain by chain ID', async () => {
      await walletStore.disconnect('cosmoshub-4');

      expect(mockWalletManager.getChainById).toHaveBeenCalledWith('cosmoshub-4');
      expect(mockChainWalletStore.disconnect).toHaveBeenCalled();
    });

    it('should get account for chain by chain ID', async () => {
      const mockAccount: WalletAccount = {
        address: 'cosmos1abc123',
        pubkey: new Uint8Array([1, 2, 3]),
        isNanoLedger: false,
        algo: 'secp256k1' as Algo,
      };

      mockChainWalletStore.getAccount.mockResolvedValue(mockAccount);

      const account = await walletStore.getAccount('cosmoshub-4');

      expect(mockWalletManager.getChainById).toHaveBeenCalledWith('cosmoshub-4');
      expect(mockChainWalletStore.getAccount).toHaveBeenCalled();
      expect(account).toBe(mockAccount);
    });

    it('should add suggest chain for chain by chain ID', async () => {
      await walletStore.addSuggestChain('cosmoshub-4');

      expect(mockWalletManager.getChainById).toHaveBeenCalledWith('cosmoshub-4');
      expect(mockChainWalletStore.addSuggestChain).toHaveBeenCalled();
    });

    it('should get provider for chain by chain ID', async () => {
      const mockProvider = { provider: 'test' };
      mockChainWalletStore.getProvider.mockResolvedValue(mockProvider);

      const provider = await walletStore.getProvider('cosmoshub-4');

      expect(mockWalletManager.getChainById).toHaveBeenCalledWith('cosmoshub-4');
      expect(mockChainWalletStore.getProvider).toHaveBeenCalled();
      expect(provider).toBe(mockProvider);
    });

    it('should throw error when chain ID not found', async () => {
      mockWalletManager.getChainById.mockReturnValue(undefined);

      await expect(walletStore.connect('non-existent')).rejects.toThrow();
      await expect(walletStore.disconnect('non-existent')).rejects.toThrow();
      await expect(walletStore.getAccount('non-existent')).rejects.toThrow();
      await expect(walletStore.addSuggestChain('non-existent')).rejects.toThrow();
      await expect(walletStore.getProvider('non-existent')).rejects.toThrow();
    });
  });

  describe('Multiple Chains', () => {
    it('should handle operations on different chains', async () => {
      const mockChainWalletStore2 = {
        connect: jest.fn(),
        disconnect: jest.fn(),
        getAccount: jest.fn(),
        addSuggestChain: jest.fn(),
        getProvider: jest.fn(),
        getOfflineSigner: jest.fn(),
        walletState: WalletState.Disconnected,
        errorMessage: '',
      } as any;

      // Mock different chain wallet stores for different chains
      (ChainWalletStore as jest.Mock)
        .mockImplementationOnce(() => mockChainWalletStore)
        .mockImplementationOnce(() => mockChainWalletStore2);

      const walletStore2 = new WalletStore(mockWallet, mockChains, mockInterchainStore, mockWalletManager);

      await walletStore2.connect('cosmoshub-4');
      await walletStore2.connect('osmosis-1');

      expect(mockChainWalletStore.connect).toHaveBeenCalled();
      expect(mockChainWalletStore2.connect).toHaveBeenCalled();
    });
  });
});
