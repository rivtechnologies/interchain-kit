import { getValidRpcEndpoint, isValidRpcEndpoint, RpcInfo } from '../../src/utils/endpoint';

describe('endpoint utility functions', () => {
  const mockFetch = jest.fn();

  beforeAll(() => {
    global.fetch = mockFetch;
  });

  afterEach(() => {
    mockFetch.mockClear();
  });

  afterAll(() => {
    delete global.fetch;
  });

  describe('isValidRpcEndpoint', () => {
    it('should return true for a valid cosmos RPC endpoint', async () => {
      mockFetch.mockResolvedValueOnce({ status: 200 });

      const result = await isValidRpcEndpoint('https://valid-cosmos-endpoint.com', 'cosmos');
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('https://valid-cosmos-endpoint.com', expect.any(Object));
    });

    it('should return false for an invalid cosmos RPC endpoint', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await isValidRpcEndpoint('https://invalid-cosmos-endpoint.com', 'cosmos');
      expect(result).toBe(false);
    });

    it('should return true for a valid eip155 RPC endpoint', async () => {
      mockFetch.mockResolvedValueOnce({ status: 200 });

      const result = await isValidRpcEndpoint('https://valid-eip155-endpoint.com', 'eip155');
      expect(result).toBe(true);
    });

    it('should throw an error for unsupported chain types', async () => {
      await expect(isValidRpcEndpoint('https://unsupported-endpoint.com', 'unsupported' as any)).rejects.toThrow(
        'unsupported chain type'
      );
    });
  });

  describe('getValidRpcEndpoint', () => {
    it('should return the first valid endpoint', async () => {
      const endpoints: RpcInfo[] = [
        { endpoint: 'https://invalid-endpoint.com', chainType: 'cosmos' },
        { endpoint: 'https://valid-endpoint.com', chainType: 'cosmos' },
      ];

      mockFetch
        .mockRejectedValueOnce(new Error('Network error')) // First endpoint fails
        .mockResolvedValueOnce({ status: 200 }); // Second endpoint succeeds

      const result = await getValidRpcEndpoint(endpoints);
      expect(result).toBe('https://valid-endpoint.com');
    });

    it('should return an empty string if no valid endpoints are found', async () => {
      const endpoints: RpcInfo[] = [
        { endpoint: 'https://invalid-endpoint-1.com', chainType: 'cosmos' },
        { endpoint: 'https://invalid-endpoint-2.com', chainType: 'cosmos' },
      ];

      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await getValidRpcEndpoint(endpoints);
      expect(result).toBe('');
    });

    it('should handle timeout errors gracefully', async () => {
      const endpoints: RpcInfo[] = [
        { endpoint: 'https://timeout-endpoint.com', chainType: 'cosmos' },
      ];

      mockFetch.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ status: 200 }), 2000)));

      const result = await getValidRpcEndpoint(endpoints);
      expect(result).toBe('');
    });
  });
});