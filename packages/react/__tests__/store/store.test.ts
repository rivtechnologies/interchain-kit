import { AssetList, Chain } from '@chain-registry/v2-types';
import { createInterchainStore, InterchainStore } from '../../src/store/store';
import { WalletManager, WalletState, SignerOptions, EndpointOptions } from '@interchain-kit/core';

const localStorageMock: Storage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string): void => {
      store[key] = value.toString();
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
    key: (index: number): string | null => Object.keys(store)[index] || null,
    length: 0,
  };
})();

Object.defineProperties(global, {
  localStorage: {
    value: localStorageMock,
    writable: true
  }
})

describe('InterchainStore', () => {
  let walletManager: WalletManager;
  let store: InterchainStore;
  let useStore: ReturnType<typeof createInterchainStore>;

  beforeEach(() => {
    walletManager = {
      chains: [{ chainName: 'chain1', chainId: '1' }] as Chain[],
      assetLists: [{ chainName: 'chain1', assets: [] }] as AssetList[],
      wallets: [{ info: { name: 'wallet1' } }] as any[],
      signerOptions: {} as SignerOptions,
      endpointOptions: {} as EndpointOptions,
      preferredSignTypeMap: {},
      signerOptionMap: {},
      endpointOptionsMap: {},
      init: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      getAccount: jest.fn(),
      getRpcEndpoint: jest.fn(),
      getChainLogoUrl: jest.fn(),
      getChainByName: jest.fn(),
      getAssetListByName: jest.fn(),
      getDownloadLink: jest.fn(),
      getOfflineSigner: jest.fn(),
      getPreferSignType: jest.fn(),
      getSignerOptions: jest.fn(),
      getWalletByName: jest.fn(),
      getSigningClient: jest.fn(),
      getEnv: jest.fn(),
      addChains: jest.fn(),
    } as unknown as WalletManager;

    store = createInterchainStore(walletManager).getState();
    useStore = createInterchainStore(walletManager);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize store with wallet manager data', () => {
    expect(store.chains).toEqual(walletManager.chains);
    expect(store.assetLists).toEqual(walletManager.assetLists);
    expect(store.wallets).toEqual(walletManager.wallets);
    expect(store.signerOptions).toEqual(walletManager.signerOptions);
    expect(store.endpointOptions).toEqual(walletManager.endpointOptions);
  });

  it('should set current chain name', () => {
    useStore.getState().setCurrentChainName('chain1');
    expect(useStore.getState().currentChainName).toBe('chain1');
  });

  it('should set current wallet name', () => {
    useStore.getState().setCurrentWalletName('wallet1');
    expect(useStore.getState().currentWalletName).toBe('wallet1');
  });

  it('should update chain wallet state', () => {
    useStore.getState().updateChainWalletState('wallet1', 'chain1', { walletState: WalletState.Connected });
    const state = useStore.getState().getChainWalletState('wallet1', 'chain1');
    expect(state?.walletState).toBe(WalletState.Connected);
  });

  it('should connect to a wallet', async () => {
    (walletManager.connect as jest.Mock).mockResolvedValueOnce(undefined);
    await useStore.getState().connect('wallet1', 'chain1');
    expect(useStore.getState().currentChainName).toBe('chain1');
    expect(useStore.getState().currentWalletName).toBe('wallet1');
    const state = useStore.getState().getChainWalletState('wallet1', 'chain1');
    expect(state?.walletState).toBe(WalletState.Connected);
  });

  it('should handle connection error', async () => {
    (walletManager.connect as jest.Mock).mockRejectedValueOnce(new Error('Connection error'));
    await useStore.getState().connect('wallet1', 'chain1');
    const state = useStore.getState().getChainWalletState('wallet1', 'chain1');
    expect(state?.walletState).toBe(WalletState.Disconnected);
    expect(state?.errorMessage).toBe('Connection error');
  });

  it('should disconnect from a wallet', async () => {
    (walletManager.disconnect as jest.Mock).mockResolvedValueOnce(undefined);
    await useStore.getState().disconnect('wallet1', 'chain1');
    const state = useStore.getState().getChainWalletState('wallet1', 'chain1');
    expect(state?.walletState).toBe(WalletState.Disconnected);
    expect(state?.account).toBeNull();
  });

  it('should get account', async () => {
    const account = { address: 'address1' };
    (walletManager.getAccount as jest.Mock).mockResolvedValueOnce(account);
    const result = await useStore.getState().getAccount('wallet1', 'chain1');
    expect(result).toBe(account);
    const state = useStore.getState().getChainWalletState('wallet1', 'chain1');
    expect(state?.account).toBe(account);
  });

  it('should get RPC endpoint', async () => {
    const rpcEndpoint = 'http://localhost:26657';
    (walletManager.getRpcEndpoint as jest.Mock).mockResolvedValueOnce(rpcEndpoint);
    const result = await useStore.getState().getRpcEndpoint('wallet1', 'chain1');
    expect(result).toBe(rpcEndpoint);
    const state = useStore.getState().getChainWalletState('wallet1', 'chain1');
    expect(state?.rpcEndpoint).toBe(rpcEndpoint);
  });

  it('should add chains', () => {
    const newChains = [{ chainName: 'chain2', chainId: '2' }] as Chain[];
    const newAssetLists = [{ chainName: 'chain2', assets: [] }] as AssetList[];
    const signingMock = jest.fn().mockReturnValue('prefix');
    const newSignerOptions = {
      signing: signingMock,
    } as SignerOptions;
    const newEndpointOptions = {
      endpoints: { chain2: { rpc: ['http://localhost:26657'] } },
    } as EndpointOptions;
    useStore.getState().addChains(newChains, newAssetLists, newSignerOptions, newEndpointOptions);
    expect(walletManager.addChains).toHaveBeenCalledWith(newChains, newAssetLists, newSignerOptions, newEndpointOptions);
    expect(useStore.getState().chains).toContainEqual(newChains[0]);
    expect(useStore.getState().assetLists).toContainEqual(newAssetLists[0]);
    expect(useStore.getState().signerOptionMap).toEqual({ chain2: 'prefix' });
    expect(useStore.getState().endpointOptionsMap).toEqual({ chain2: newEndpointOptions.endpoints.chain2 });
    expect(useStore.getState().getChainWalletState('wallet1', 'chain2').signerOption).toBe('prefix');
    expect(useStore.getState().getChainWalletState('wallet1', 'chain2').rpcEndpoint).toBe('http://localhost:26657');
  });
});