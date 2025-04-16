import { renderHook } from '@testing-library/react';
import { useWalletManager } from '../../src/hooks/useWalletManager';
import { useInterchainWalletContext } from '../../src/provider';
import { useStore } from 'zustand';

jest.mock('../../src/provider', () => ({
    useInterchainWalletContext: jest.fn(),
}));

jest.mock('zustand', () => ({
    useStore: jest.fn(),
}));

describe('useWalletManager', () => {
    it('should return the result of useStore with the store from useInterchainWalletContext', () => {
        const mockStore = {};
        const mockResult = { wallet: 'mockWallet' };

        (useInterchainWalletContext as jest.Mock).mockReturnValue(mockStore);
        (useStore as jest.Mock).mockReturnValue(mockResult);

        const { result } = renderHook(() => useWalletManager());

        expect(useInterchainWalletContext).toHaveBeenCalled();
        expect(useStore).toHaveBeenCalledWith(mockStore);
        expect(result.current).toBe(mockResult);
    });
});