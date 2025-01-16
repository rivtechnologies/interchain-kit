import { isValidRpcEndpoint, getValidRpcEndpoint, isValidRestEndpoint, getValidRestEndpoint } from '../../src/utils/endpoint';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Endpoint Utils', () => {
  describe('isValidRpcEndpoint', () => {
    it('should return true for a valid RPC endpoint', async () => {
      mockedAxios.get.mockImplementationOnce(() => Promise.resolve({ status: 200 }));
      const result = await isValidRpcEndpoint('http://valid-endpoint');
      expect(result).toBe(true);
    });

    it('should return false for an invalid RPC endpoint', async () => {
      mockedAxios.get.mockImplementationOnce(() => Promise.reject(new Error('Network Error')));
      const result = await isValidRpcEndpoint('http://invalid-endpoint');
      expect(result).toBe(false);
    });
  });

  describe('getValidRpcEndpoint', () => {
    it('should return the first valid RPC endpoint', async () => {
      mockedAxios.get.mockImplementationOnce(() => Promise.resolve({ status: 200 }));
      const endpoints = ['http://valid-endpoint', 'http://another-endpoint'];
      const result = await getValidRpcEndpoint(endpoints);
      expect(result).toBe('http://valid-endpoint');
    });

    it('should return an empty string if no valid RPC endpoint is found', async () => {
      mockedAxios.get.mockImplementation(() => Promise.reject(new Error('Network Error')));
      const endpoints = ['http://invalid-endpoint', 'http://another-invalid-endpoint'];
      const result = await getValidRpcEndpoint(endpoints);
      expect(result).toBe('');
    });
  });

  describe('isValidRestEndpoint', () => {
    it('should return true for a valid REST endpoint', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({ status: 200 });
      const result = await isValidRestEndpoint('http://valid-endpoint');
      expect(result).toBe(true);
    });

    it('should return false for an invalid REST endpoint', async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network Error'));
      const result = await isValidRestEndpoint('http://invalid-endpoint');
      expect(result).toBe(false);
    });
  });

  describe('getValidRestEndpoint', () => {
    it('should return the first valid REST endpoint', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({ status: 200 });
      const endpoints = ['http://valid-endpoint', 'http://another-endpoint'];
      const result = await getValidRestEndpoint(endpoints);
      expect(result).toBe('http://valid-endpoint');
    });

    it('should return an empty string if no valid REST endpoint is found', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network Error'));
      const endpoints = ['http://invalid-endpoint', 'http://another-invalid-endpoint'];
      const result = await getValidRestEndpoint(endpoints);
      expect(result).toBe('');
    });

    it('should handle HttpEndpoint objects for REST endpoints', async () => {
      const endpoint = { url: 'http://valid-endpoint', headers: { 'Authorization': 'Bearer token' } };
      global.fetch = jest.fn().mockResolvedValueOnce({ status: 200 });
      const result = await isValidRestEndpoint(endpoint);
      expect(result).toBe(true);
    });
  });
});

