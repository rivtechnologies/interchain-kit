import { createMockChain } from './../helpers/mock-chain-factory';
import { CosmosWallet } from '../../src/wallets/cosmos-wallet';
import { BaseWallet } from '../../src/wallets/base-wallet';
import { getClientFromExtension } from '../../src/utils';
import { chainRegistryChainToKeplr } from '@chain-registry/keplr';
import { chain as cosmosChain, assetList as cosmosAssetList } from '@chain-registry/v2/mainnet/cosmoshub'

jest.mock('../../src/utils', () => ({
    getClientFromExtension: jest.fn(),
}));

jest.mock('@chain-registry/keplr', () => ({
    chainRegistryChainToKeplr: jest.fn(),
}));

describe('CosmosWallet', () => {
    let wallet: CosmosWallet;

    beforeEach(() => {
        wallet = new CosmosWallet({
            windowKey: 'keplr',
            cosmosKey: 'keplr',
            name: 'cosmosTestWallet',
            mode: 'extension',
            prettyName: 'Cosmos Test Wallet',
        });
        wallet.setChainMap([cosmosChain]);
        wallet.assetLists = [cosmosAssetList];
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize the wallet by getting the client from extension', async () => {
        const mockClient = { enable: jest.fn() };
        (getClientFromExtension as jest.Mock).mockResolvedValue(mockClient);

        await wallet.init();

        expect(getClientFromExtension).toHaveBeenCalledWith('keplr');
        expect(wallet.client).toBe(mockClient);
    });

    it('should connect to a chain', async () => {
        const mockClient = { enable: jest.fn() };
        wallet.client = mockClient;

        await wallet.connect('cosmoshub-4');

        expect(mockClient.enable).toHaveBeenCalledWith('cosmoshub-4');
    });

    it('should suggest a chain if connection fails with not "Request rejected"', async () => {
        const mockClient = {
            enable: jest.fn().mockRejectedValue(new Error('some error')),
            experimentalSuggestChain: jest.fn(),
        };
        wallet.client = mockClient;

        (chainRegistryChainToKeplr as jest.Mock).mockReturnValue({ chainId: 'cosmoshub-4' });

        await wallet.connect('cosmoshub-4');

        expect(mockClient.experimentalSuggestChain).toHaveBeenCalledWith({ chainId: 'cosmoshub-4' });
    });

    it('should not suggest a chain if connection fails with "Request rejected"', async () => {
        const mockClient = {
            enable: jest.fn().mockRejectedValue(new Error('Request rejected')),
            experimentalSuggestChain: jest.fn(),
        };
        wallet.client = mockClient;

        await expect(wallet.connect('cosmoshub-4')).rejects.toThrow('Request rejected');

        expect(mockClient.experimentalSuggestChain).not.toHaveBeenCalled();
    })

    it('should disconnect from a chain', async () => {
        const mockClient = { disable: jest.fn() };
        wallet.client = mockClient;

        await wallet.disconnect('cosmoshub-4');

        expect(mockClient.disable).toHaveBeenCalledWith('cosmoshub-4');
    });

    it('should get account details', async () => {
        const mockClient = {
            getKey: jest.fn().mockResolvedValue({
                name: 'test-user',
                bech32Address: 'cosmos1address',
                algo: 'secp256k1',
                pubKey: new Uint8Array([1, 2, 3]),
                isNanoLedger: false,
            }),
        };
        wallet.client = mockClient;

        const account = await wallet.getAccount('cosmoshub-4');

        expect(mockClient.getKey).toHaveBeenCalledWith('cosmoshub-4');
        expect(account).toEqual({
            username: 'test-user',
            address: 'cosmos1address',
            algo: 'secp256k1',
            pubkey: new Uint8Array([1, 2, 3]),
            isNanoLedger: false,
        });
    });

    it('should add a suggested chain', async () => {
        const mockClient = { experimentalSuggestChain: jest.fn() };
        wallet.client = mockClient;
        wallet.chainMap.set('cosmoshub-4', cosmosChain);

        (chainRegistryChainToKeplr as jest.Mock).mockReturnValue({ chainId: 'cosmoshub-4' });

        await wallet.addSuggestChain('cosmoshub-4');

        expect(chainRegistryChainToKeplr).toHaveBeenCalledWith(cosmosChain, [cosmosAssetList]);
        expect(mockClient.experimentalSuggestChain).toHaveBeenCalledWith({ chainId: 'cosmoshub-4' });
    });

    it('should throw an error if adding a suggested chain fails', async () => {
        const mockClient = { experimentalSuggestChain: jest.fn().mockRejectedValue(new Error('suggestion error')) };
        wallet.client = mockClient;
        wallet.chainMap.set('cosmoshub-4', cosmosChain);

        (chainRegistryChainToKeplr as jest.Mock).mockReturnValue({ chainId: 'cosmoshub-4' });

        await expect(wallet.addSuggestChain('cosmoshub-4')).rejects.toThrow('suggestion error');
    });


});