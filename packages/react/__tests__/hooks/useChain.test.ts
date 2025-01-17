import { renderHook, act } from '@testing-library/react-hooks';
import { useChain } from '../../src/hooks/useChain';
import { useWalletManager } from '../../src/hooks/useWalletManager';
import { useWalletModal } from '../../src/modal';
import { ChainNameNotExist } from '@interchain-kit/core';
import { ChainWallet } from '../../src/store/chain-wallet';

jest.mock('../../src/hooks/useWalletManager');
jest.mock('../../src/modal');

describe('useChain', () => {
  const mockUseWalletManager = useWalletManager as jest.MockedFunction<typeof useWalletManager>;
  const mockUseWalletModal = useWalletModal as jest.MockedFunction<typeof useWalletModal>;

  const mockWalletManager = {
    assetLists: [{ chainName: 'test-chain' }],
    currentWalletName: 'test-wallet',
    disconnect: jest.fn(),
    setCurrentChainName: jest.fn(),
    getChainByName: jest.fn(),
    getWalletByName: jest.fn(),
    getChainWalletState: jest.fn(),
    getChainLogoUrl: jest.fn(),
    connect: jest.fn(),
    getSigningClient: jest.fn(),
    getRpcEndpoint: jest.fn(),
    getAccount: jest.fn(),
  };

  const mockWalletModal = {
    open: jest.fn(),
    close: jest.fn(),
  };

  beforeEach(() => {
    mockUseWalletManager.mockReturnValue(mockWalletManager);
    mockUseWalletModal.mockReturnValue(mockWalletModal);
  });

  it('should throw ChainNameNotExist if chain does not exist', () => {
    mockWalletManager.getChainByName.mockReturnValue(undefined);

    const { result } = renderHook(() => useChain('non-existent-chain'));

    expect(result.error).toEqual(new ChainNameNotExist('non-existent-chain'));
  });

  it('should return correct values when chain exists', () => {
    const mockChain = { name: 'test-chain' };
    const mockWallet = { name: 'test-wallet' };
    const mockChainWalletState = {
      walletState: 'connected',
      account: { username: 'test-user', address: 'test-address' },
      errorMessage: 'test-error',
      rpcEndpoint: 'test-rpc-endpoint',
    };

    mockWalletManager.getChainByName.mockReturnValue(mockChain);
    mockWalletManager.getWalletByName.mockReturnValue(mockWallet);
    mockWalletManager.getChainWalletState.mockReturnValue(mockChainWalletState);

    const { result } = renderHook(() => useChain('test-chain'));

    expect(result.current.chain).toEqual(mockChain);
    expect(result.current.assetList).toEqual(mockWalletManager.assetLists[0]);
    expect(result.current.wallet).toBeInstanceOf(ChainWallet);
    expect(result.current.status).toEqual('connected');
    expect(result.current.username).toEqual('test-user');
    expect(result.current.message).toEqual('test-error');
    expect(result.current.rpcEndpoint).toEqual('test-rpc-endpoint');
    expect(result.current.logoUrl).toEqual(mockWalletManager.getChainLogoUrl('test-chain'));
    expect(result.current.address).toEqual('test-address');
  });

  it('should call setCurrentChainName and open modal on connect', () => {
    const mockChain = { name: 'test-chain' };
    mockWalletManager.getChainByName.mockReturnValue(mockChain);

    const { result } = renderHook(() => useChain('test-chain'));

    act(() => {
      result.current.connect();
    });

    expect(mockWalletManager.setCurrentChainName).toHaveBeenCalledWith('test-chain');
    expect(mockWalletModal.open).toHaveBeenCalled();
  });

  it('should call disconnect with correct arguments', async () => {
    const mockChain = { name: 'test-chain' };
    mockWalletManager.getChainByName.mockReturnValue(mockChain);

    const { result } = renderHook(() => useChain('test-chain'));

    await act(async () => {
      await result.current.disconnect();
    });

    expect(mockWalletManager.disconnect).toHaveBeenCalledWith('test-wallet', 'test-chain');
  });

  it('should call setCurrentChainName and open modal on openView', () => {
    const mockChain = { name: 'test-chain' };
    mockWalletManager.getChainByName.mockReturnValue(mockChain);

    const { result } = renderHook(() => useChain('test-chain'));

    act(() => {
      result.current.openView();
    });

    expect(mockWalletManager.setCurrentChainName).toHaveBeenCalledWith('test-chain');
    expect(mockWalletModal.open).toHaveBeenCalled();
  });

  it('should call close modal on closeView', () => {
    const mockChain = { name: 'test-chain' };
    mockWalletManager.getChainByName.mockReturnValue(mockChain);

    const { result } = renderHook(() => useChain('test-chain'));

    act(() => {
      result.current.closeView();
    });

    expect(mockWalletModal.close).toHaveBeenCalled();
  });

  it('should return correct rpcEndpoint', () => {
    const mockChain = { name: 'test-chain' };
    mockWalletManager.getChainByName.mockReturnValue(mockChain);

    const { result } = renderHook(() => useChain('test-chain'));

    expect(result.current.getRpcEndpoint()).toEqual('test-rpc-endpoint');
  });

  it('should return correct signing client', () => {
    const mockChain = { name: 'test-chain' };
    mockWalletManager.getChainByName.mockReturnValue(mockChain);

    const { result } = renderHook(() => useChain('test-chain'));

    expect(result.current.getSigningClient()).toEqual(mockWalletManager.getSigningClient('test-wallet', 'test-chain'));
  });
});