/**
 * @jest-environment jsdom
 */

import { WalletState } from '@interchain-kit/core';
import { ChainWalletStore, InterchainStore, WalletManagerStore } from '@interchain-kit/store';
import { renderHook, waitFor } from '@testing-library/react';

import { useChainWallet } from '../../src/hooks/useChainWallet';
import { useWalletManager } from '../../src/hooks/useWalletManager';
import { MockWallet } from '../helpers/mock-wallet';

// Mock the useWalletManager hook
jest.mock('../../src/hooks/useWalletManager', () => ({
  useWalletManager: jest.fn(),
}));

describe('useChainWallet', () => {

  const mockWallet = new MockWallet({ name: 'test-wallet', mode: 'extension', prettyName: 'Test Wallet' });

  const mockChainWalletStore = {
    wallet: mockWallet,
    chain: { chainName: 'test-chain', chainType: 'cosmos' as const },
    networkWalletMap: new Map(),
    store: {} as InterchainStore,
    walletManager: {} as any,
    info: mockWallet.info,
    events: {} as any,
    chainMap: new Map(),
    chainNameMap: new Map(),
    assetLists: [],
    client: null,
    walletState: 'Disconnected' as any,
    errorMessage: '',
    init: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    getAccount: jest.fn(),
    addSuggestChain: jest.fn(),
    getProvider: jest.fn(),
    setChainMap: jest.fn(),
    addChain: jest.fn(),
    setAssetLists: jest.fn(),
    addAssetList: jest.fn(),
    getChainById: jest.fn(),
    getChainByName: jest.fn(),
    getAssetListByChainId: jest.fn(),
    getOfflineSigner: jest.fn(),
    getWalletOfType: jest.fn(),
    refreshAccount: jest.fn()
  } as jest.Mocked<ChainWalletStore>;

  const mockWalletManager: jest.Mocked<WalletManagerStore> = {
    chains: [{ chainName: 'test-chain', chainType: 'cosmos' as const }],
    assetLists: [{ chainName: 'test-chain', assets: [] }],
    wallets: [],
    store: {} as InterchainStore,
    walletManager: {} as any,
    localStorage: {} as any,
    init: jest.fn(),
    restore: jest.fn(),
    subscribe: jest.fn(),
    getState: jest.fn(),
    walletConnectQRCodeUri: '',
    isReady: true,
    currentWalletName: 'test-wallet',
    currentChainName: 'test-chain',
    setCurrentWalletName: jest.fn(),
    setCurrentChainName: jest.fn(),
    getChainById: jest.fn(),
    getChainWalletState: jest.fn(),
    updateChainWalletState: jest.fn(),
    getChainWalletByName: jest.fn().mockReturnValue(mockChainWalletStore),
    modalIsOpen: false,
    openModal: jest.fn(),
    closeModal: jest.fn(),
    signerOptions: {},
    endpointOptions: {},
    preferredSignTypeMap: {},
    signerOptionMap: {},
    endpointOptionsMap: {},
    addChains: jest.fn(),
    getChainLogoUrl: jest.fn(),
    getWalletByName: jest.fn(),
    getChainByName: jest.fn().mockReturnValue({ name: 'test-chain' }),
    getAssetListByName: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    getAccount: jest.fn(),
    getRpcEndpoint: jest.fn(),
    getPreferSignType: jest.fn(),
    getSignerOptions: jest.fn(),
    getOfflineSigner: jest.fn(),
    getSigningClient: jest.fn(),
    getEnv: jest.fn(),
    getDownloadLink: jest.fn(),
  } as jest.Mocked<WalletManagerStore>;

  beforeEach(() => {
    jest.clearAllMocks()
      ; (useWalletManager as jest.Mock).mockReturnValue(mockWalletManager);
  });

  it('should return the correct chain and wallet data', async () => {
    const chainName = 'test-chain';
    const walletName = 'test-wallet';

    const mockChain = { chainName: 'test-chain', chainType: 'cosmos' as const };

    const mockChainWalletState = {
      walletState: WalletState.Connected,
      account: { username: 'test-user', address: 'test-address', algo: 'secp256k1' as const, pubkey: new Uint8Array() },
      errorMessage: '',
      rpcEndpoint: 'http://localhost:26657',
      chainName: 'test-chain',
      walletName: 'test-wallet',
    };

    mockWalletManager.getChainByName.mockReturnValue(mockChain);
    mockWalletManager.getChainWalletByName.mockReturnValue(mockChainWalletStore);
    mockWalletManager.getChainWalletState.mockReturnValue(mockChainWalletState);
    mockWalletManager.getChainLogoUrl.mockReturnValue('http://logo.url');
    mockWalletManager.getAssetListByName.mockReturnValue({ chainName: 'test-chain', assets: [] });

    const { result } = renderHook(() => useChainWallet(chainName, walletName));

    await waitFor(() => {
      expect(result.current.chain).toEqual(mockChain);
      expect(result.current.wallet).toBe(mockChainWalletStore);
      expect(result.current.assetList).toEqual({ chainName: 'test-chain', assets: [] });
      expect(result.current.status).toBe(WalletState.Connected);
      expect(result.current.username).toBe('test-user');
      expect(result.current.address).toBe('test-address');
      expect(result.current.message).toBe('');
      expect(result.current.rpcEndpoint).toBe('http://localhost:26657');
      expect(result.current.logoUrl).toBe('http://logo.url');
    });
  });

  it('should call disconnect when disconnect is invoked', async () => {
    const chainName = 'test-chain';
    const walletName = 'test-wallet';

    const { result } = renderHook(() => useChainWallet(chainName, walletName));

    result.current.disconnect();

    await waitFor(() => {
      expect(mockWalletManager.disconnect).toHaveBeenCalledWith(walletName, chainName);
    });


  });

  it('should return the correct RPC endpoint', async () => {
    const chainName = 'test-chain';
    const walletName = 'test-wallet';

    mockWalletManager.getRpcEndpoint.mockResolvedValue('http://localhost:26657');

    const { result } = renderHook(() => useChainWallet(chainName, walletName));

    const endpointResult = await result.current.getRpcEndpoint();

    await waitFor(() => {
      expect(endpointResult).toBe('http://localhost:26657');
    });
  });

  it('should return the signing client', async () => {
    const chainName = 'test-chain';
    const walletName = 'test-wallet';

    const mockSigningClient: any = {
    };

    mockWalletManager.getSigningClient.mockReturnValue(mockSigningClient);

    const { result } = renderHook(() => useChainWallet(chainName, walletName));

    await waitFor(() => {
      expect(result.current.getSigningClient()).toBe(mockSigningClient);
    });
  });
});