import { renderHook } from '@testing-library/react';

import { useWalletManager } from '../../src/hooks/useWalletManager';
import { useInterchainWalletContext } from '../../src/provider';

jest.mock('../../src/provider', () => ({
  useInterchainWalletContext: jest.fn(),
}));

jest.mock('../../src/hooks/useForceUpdate', () => ({
  useForceUpdate: jest.fn(() => jest.fn()),
}));

describe('useWalletManager', () => {
  it('should return the wallet manager with bound methods', () => {
    const mockWalletManager = {
      subscribe: jest.fn(() => jest.fn()),
      getWalletByName: jest.fn(),
      getChainByName: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    };

    (useInterchainWalletContext as jest.Mock).mockReturnValue(mockWalletManager);

    const { result } = renderHook(() => useWalletManager());

    expect(useInterchainWalletContext).toHaveBeenCalled();
    expect(mockWalletManager.subscribe).toHaveBeenCalled();
    expect(result.current).toBeDefined();
    expect(typeof result.current.getWalletByName).toBe('function');
    expect(typeof result.current.getChainByName).toBe('function');
    expect(typeof result.current.connect).toBe('function');
    expect(typeof result.current.disconnect).toBe('function');
  });

  it('should handle getter properties correctly', () => {
    const mockWalletManager = {
      subscribe: jest.fn(() => jest.fn()),
      get isReady() {
        return true;
      },
      getWalletByName(walletName: string) {
        return walletName;
      },
    };

    (useInterchainWalletContext as jest.Mock).mockReturnValue(mockWalletManager);

    const { result } = renderHook(() => useWalletManager());

    expect(result.current.isReady).toBe(true);
    expect(result.current.getWalletByName('test-wallet')).toBe('test-wallet');
  });
});