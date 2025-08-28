import { SolanaWallet } from '../../src/wallets/solana-wallet';
import { Chain } from '@chain-registry/types';
import { Wallet } from '../../src/types';
import { Transaction, VersionedTransaction, SolanaSignInData } from '../../src/types/solana';

// Mock the utils module
const mockGetClientFromExtension = require('../../src/utils').getClientFromExtension;

jest.mock('../../src/utils', () => ({
  getClientFromExtension: jest.fn(),
}));

// Mock window.addEventListener
Object.defineProperty(global, 'window', {
  value: {
    addEventListener: jest.fn(),
  },
  writable: true,
});

describe('SolanaWallet', () => {
  let wallet: SolanaWallet;
  let mockSolanaClient: any;

  const mockWalletInfo: Wallet = {
    name: 'test-solana-wallet',
    prettyName: 'Test Solana Wallet',
    mode: 'extension',
    solanaKey: 'mockSolanaKey',
    keystoreChange: 'keystorechange',
  } as Wallet;

  const mockChain: Chain = {
    chainId: 'solana-mainnet',
    chainName: 'Solana Mainnet',
  } as Chain;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock Solana client
    mockSolanaClient = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      publicKey: {
        toString: jest.fn().mockReturnValue('mock-public-key'),
        toBytes: jest.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
      },
      request: jest.fn(),
      signAllTransactions: jest.fn(),
      signAndSendAllTransactions: jest.fn(),
      signAndSendTransaction: jest.fn(),
      signIn: jest.fn(),
      signMessage: jest.fn(),
      signTransaction: jest.fn(),
    };

    // Setup mock for getClientFromExtension
    mockGetClientFromExtension.mockResolvedValue(mockSolanaClient);

    // Create wallet instance
    wallet = new SolanaWallet(mockWalletInfo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a SolanaWallet instance', () => {
      expect(wallet).toBeInstanceOf(SolanaWallet);
      expect(wallet.info).toEqual(mockWalletInfo);
    });
  });

  describe('bindingEvent', () => {
    it('should bind keystore change event', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      wallet.bindingEvent();
      
      expect(consoleSpy).toHaveBeenCalledWith('bindingEvent', 'keystorechange');
      expect((global as any).window.addEventListener).toHaveBeenCalledWith('keystorechange', expect.any(Function));
      
      consoleSpy.mockRestore();
    });
  });

  describe('init', () => {
    it('should initialize the wallet successfully', async () => {
      await wallet.init();
      
      expect(mockGetClientFromExtension).toHaveBeenCalledWith('mockSolanaKey');
      expect(wallet.solana).toBe(mockSolanaClient);
    });

    it('should throw an error if initialization fails', async () => {
      mockGetClientFromExtension.mockRejectedValue(new Error('Initialization failed'));
      
      await expect(wallet.init()).rejects.toThrow('Initialization failed');
    });
  });

  describe('connect', () => {
    beforeEach(async () => {
      await wallet.init();
    });

    it('should connect to Solana wallet successfully', async () => {
      await wallet.connect('solana-mainnet');
      
      expect(mockSolanaClient.connect).toHaveBeenCalled();
    });

    it('should handle connection errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockSolanaClient.connect.mockRejectedValue(new Error('Connection failed'));
      
      await wallet.connect('solana-mainnet');
      
      expect(consoleSpy).toHaveBeenCalledWith(new Error('Connection failed'));
      consoleSpy.mockRestore();
    });
  });

  describe('disconnect', () => {
    beforeEach(async () => {
      await wallet.init();
    });

    it('should disconnect from Solana wallet', async () => {
      await wallet.disconnect('solana-mainnet');
      
      expect(mockSolanaClient.disconnect).toHaveBeenCalled();
    });
  });

  describe('getAccount', () => {
    beforeEach(async () => {
      await wallet.init();
    });

    it('should return account details when connected', async () => {
      const account = await wallet.getAccount('solana-mainnet');
      
      expect(account).toEqual({
        address: 'mock-public-key',
        pubkey: new Uint8Array([1, 2, 3]),
        algo: 'secp256k1',
        username: 'solana',
        isNanoLedger: false,
        isSmartContract: false,
      });
    });

    it('should throw error when not connected', async () => {
      wallet.solana = null;
      
      await expect(wallet.getAccount('solana-mainnet')).rejects.toThrow('Not connected');
    });

    it('should throw error when publicKey is not available', async () => {
      wallet.solana = { publicKey: null };
      
      await expect(wallet.getAccount('solana-mainnet')).rejects.toThrow('Not connected');
    });
  });

  describe('getOfflineSigner', () => {
    it('should throw error as Solana does not support offline signer', async () => {
      await expect(wallet.getOfflineSigner('solana-mainnet')).rejects.toThrow(
        'Solana does not support getOfflineSigner'
      );
    });
  });

  describe('addSuggestChain', () => {
    it('should throw error as Solana does not support suggest chain', async () => {
      await expect(wallet.addSuggestChain('solana-mainnet')).rejects.toThrow(
        'Solana does not support suggest chain'
      );
    });
  });

  describe('getProvider', () => {
    beforeEach(async () => {
      await wallet.init();
    });

    it('should return the Solana client', async () => {
      const provider = await wallet.getProvider('solana-mainnet');
      
      expect(provider).toBe(mockSolanaClient);
    });
  });

  describe('request', () => {
    beforeEach(async () => {
      await wallet.init();
    });

    it('should make a request to the Solana client', async () => {
      const mockResponse = { result: 'success' };
      mockSolanaClient.request.mockResolvedValue(mockResponse);
      
      const result = await wallet.request('testMethod', { param: 'value' });
      
      expect(mockSolanaClient.request).toHaveBeenCalledWith({
        method: 'testMethod',
        params: { param: 'value' },
      });
      expect(result).toBe(mockResponse);
    });
  });

  describe('signAllTransactions', () => {
    beforeEach(async () => {
      await wallet.init();
    });

    it('should sign all transactions', async () => {
      const mockTransactions: Transaction[] = [
        { message: new Uint8Array([1]), recentBlockhash: 'hash1', feePayer: 'payer1', instructions: [], signers: [], version: 0 },
        { message: new Uint8Array([2]), recentBlockhash: 'hash2', feePayer: 'payer2', instructions: [], signers: [], version: 0 },
      ];
      const mockSignedTransactions = [...mockTransactions];
      mockSolanaClient.signAllTransactions.mockResolvedValue(mockSignedTransactions);
      
      const result = await wallet.signAllTransactions(mockTransactions);
      
      expect(mockSolanaClient.signAllTransactions).toHaveBeenCalledWith(mockTransactions);
      expect(result).toBe(mockSignedTransactions);
    });
  });

  describe('signAndSendAllTransactions', () => {
    beforeEach(async () => {
      await wallet.init();
    });

    it('should sign and send all transactions', async () => {
      const mockTransactions: Transaction[] = [
        { message: new Uint8Array([1]), recentBlockhash: 'hash1', feePayer: 'payer1', instructions: [], signers: [], version: 0 },
      ];
      const mockResult = { signatures: ['sig1'] };
      mockSolanaClient.signAndSendAllTransactions.mockResolvedValue(mockResult);
      
      const result = await wallet.signAndSendAllTransactions(mockTransactions);
      
      expect(mockSolanaClient.signAndSendAllTransactions).toHaveBeenCalledWith(mockTransactions);
      expect(result).toBe(mockResult);
    });
  });

  describe('signAndSendTransaction', () => {
    beforeEach(async () => {
      await wallet.init();
    });

    it('should sign and send a transaction', async () => {
      const mockTransaction: Transaction = {
        message: new Uint8Array([1]),
        recentBlockhash: 'hash1',
        feePayer: 'payer1',
        instructions: [],
        signers: [],
        version: 0,
      };
      const mockResult = { signature: 'sig1', address: 'mock-address' };
      mockSolanaClient.signAndSendTransaction.mockResolvedValue(mockResult);
      
      const result = await wallet.signAndSendTransaction(mockTransaction);
      
      expect(mockSolanaClient.signAndSendTransaction).toHaveBeenCalledWith(mockTransaction);
      expect(result).toBe(mockResult);
    });

    it('should handle VersionedTransaction', async () => {
      const mockVersionedTransaction: VersionedTransaction = {
        signatures: [new Uint8Array([1])],
        message: {
          deserialize: jest.fn(),
          serialize: jest.fn(),
        },
      };
      const mockResult = { signature: 'sig1' };
      mockSolanaClient.signAndSendTransaction.mockResolvedValue(mockResult);
      
      const result = await wallet.signAndSendTransaction(mockVersionedTransaction);
      
      expect(mockSolanaClient.signAndSendTransaction).toHaveBeenCalledWith(mockVersionedTransaction);
      expect(result).toBe(mockResult);
    });
  });

  describe('signIn', () => {
    beforeEach(async () => {
      await wallet.init();
    });

    it('should sign in with Solana', async () => {
      const mockSignInData: SolanaSignInData = {
        domain: 'test.com',
        statement: 'Test statement',
        uri: 'https://test.com',
        version: '1',
        chainId: 'solana-mainnet',
        nonce: 'nonce123',
        issuedAt: '2023-01-01T00:00:00Z',
      };
      const mockResult = {
        address: 'mock-address',
        signature: new Uint8Array([1, 2, 3]),
        signedMessage: new Uint8Array([4, 5, 6]),
      };
      mockSolanaClient.signIn.mockResolvedValue(mockResult);
      
      const result = await wallet.signIn(mockSignInData);
      
      expect(mockSolanaClient.signIn).toHaveBeenCalledWith(mockSignInData);
      expect(result).toBe(mockResult);
    });
  });

  describe('signMessage', () => {
    beforeEach(async () => {
      await wallet.init();
    });

    it('should sign a message with default encoding', async () => {
      const mockMessage = new Uint8Array([1, 2, 3]);
      const mockResult = { signature: new Uint8Array([4, 5, 6]) };
      mockSolanaClient.signMessage.mockResolvedValue(mockResult);
      
      const result = await wallet.signMessage(mockMessage);
      
      expect(mockSolanaClient.signMessage).toHaveBeenCalledWith(mockMessage, 'utf8');
      expect(result).toBe(mockResult);
    });

    it('should sign a message with hex encoding', async () => {
      const mockMessage = new Uint8Array([1, 2, 3]);
      const mockResult = { signature: new Uint8Array([4, 5, 6]) };
      mockSolanaClient.signMessage.mockResolvedValue(mockResult);
      
      const result = await wallet.signMessage(mockMessage, 'hex');
      
      expect(mockSolanaClient.signMessage).toHaveBeenCalledWith(mockMessage, 'hex');
      expect(result).toBe(mockResult);
    });
  });

  describe('signTransaction', () => {
    beforeEach(async () => {
      await wallet.init();
    });

    it('should sign a transaction', async () => {
      const mockTransaction: Transaction = {
        message: new Uint8Array([1]),
        recentBlockhash: 'hash1',
        feePayer: 'payer1',
        instructions: [],
        signers: [],
        version: 0,
      };
      const mockSignedTransaction = { ...mockTransaction };
      mockSolanaClient.signTransaction.mockResolvedValue(mockSignedTransaction);
      
      const result = await wallet.signTransaction(mockTransaction);
      
      expect(mockSolanaClient.signTransaction).toHaveBeenCalledWith(mockTransaction);
      expect(result).toBe(mockSignedTransaction);
    });
  });


});
