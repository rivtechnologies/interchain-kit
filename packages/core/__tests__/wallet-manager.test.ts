import { WalletManager } from '../src/wallet-manager';
import { Chain, AssetList } from '@chain-registry/v2-types';
import { BaseWallet } from '../src/wallets/base-wallet';
import { SignerOptions, EndpointOptions, SignType } from '../src/types';
import { WalletNotExist, ChainNameNotExist, NoValidRpcEndpointFound } from '../src/utils';

import { createMockAssetList } from './helpers/mock-asset-list-factory';
import { createMockChain } from './helpers/mock-chain-factory';
import { createMockAccount, createMockWallet } from './helpers/mock-wallet-factory';
import { AminoGenericOfflineSigner } from '@interchainjs/cosmos/types/wallet';
import { SigningClient } from '@interchainjs/cosmos/signing-client';
import { createSignerOption } from './helpers/mock-setting-factory';

describe('WalletManager', () => {
  (global as any).window = {

    navigator: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      platform: 'Win32'
    }

  };


  let chains: Chain[];
  let assetLists: AssetList[];
  let wallets: BaseWallet[];
  let signerOptions: SignerOptions
  let endpointOptions: EndpointOptions;
  let walletManager: WalletManager;

  let wallet1: BaseWallet;
  let wallet2: BaseWallet;
  let chain1: Chain
  let chain2: Chain
  let assetList1: AssetList
  let assetList2: AssetList

  beforeEach(() => {
    chain1 = createMockChain({ chainName: 'chain-1', chainId: '1', rpcEndpoint: [{ address: 'http://localhost:26657' }], chainType: 'cosmos' });
    chain2 = createMockChain({ chainName: 'chain-2', chainId: '2', rpcEndpoint: [{ address: 'http://localhost:26658' }], chainType: 'cosmos' });
    assetList1 = createMockAssetList({
      chainName: 'chain-1', assets: [{
        logoURIs: { png: 'logo.png' },
        denomUnits: [],
        typeAsset: 'unknown',
        base: '',
        name: '',
        display: '',
        symbol: ''
      }]
    });
    assetList2 = createMockAssetList({
      chainName: 'chain-2', assets: [{
        logoURIs: { png: 'logo2.png' },
        denomUnits: [],
        typeAsset: 'unknown',
        base: '',
        name: '',
        display: '',
        symbol: ''
      }]
    });

    wallet1 = createMockWallet({
      name: 'wallet-1',
      mode: 'ledger',
      prettyName: 'pretty wallet1'
    });

    wallet2 = createMockWallet({
      name: 'wallet-2',
      mode: 'ledger',
      prettyName: 'pretty wallet2'
    });

    chains = [chain1, chain2];
    assetLists = [assetList1, assetList2];
    wallets = [wallet1, wallet2];
    signerOptions = {
      signing: (chainName) => createSignerOption(chainName as string),
      preferredSignType(chainName): SignType {
        const map = {
          [chain1.chainName]: 'amino' as SignType,
          [chain2.chainName]: 'direct' as SignType
        }
        return map[chainName as string] || 'amino';
      },
    }
    endpointOptions = { endpoints: { 'chain-1': { rpc: ['http://localhost:26657'] } } };

    walletManager = new WalletManager(chains, assetLists, wallets, signerOptions, endpointOptions);

  });

  it('should initialize wallets', async () => {
    wallet1.init = jest.fn();
    wallet2.init = jest.fn();
    await walletManager.init();
    expect(wallets[0].init).toHaveBeenCalled();
    expect(wallets[1].init).toHaveBeenCalled();
  });

  it('should create a WalletManager instance', async () => {
    const wm = await WalletManager.create(chains, assetLists, wallets, signerOptions, endpointOptions);
    expect(wm).toBeInstanceOf(WalletManager);
  });

  it('should add new chains', () => {
    const newChain = createMockChain({ chainName: 'chainToAdd', chainId: '3', rpcEndpoint: [{ address: 'http://localhost:26659' }], chainType: 'cosmos' });
    const newAssetList = createMockAssetList({ chainName: 'chainToAdd', assets: [] });
    walletManager.addChains([newChain], [newAssetList], signerOptions, endpointOptions);
    expect(walletManager.chains).toContain(newChain);
    expect(walletManager.assetLists).toContain(newAssetList);
    expect(walletManager.signerOptionMap[newChain.chainName]).toEqual(signerOptions.signing?.(newChain.chainName));
  });

  it('should get chain logo URL', () => {
    const logoUrl = walletManager.getChainLogoUrl(chain1.chainName);
    expect(logoUrl).toBe(assetList1?.assets?.[0]?.logoURIs?.png);
  });

  it('should get wallet by name', () => {
    const wallet = walletManager.getWalletByName(wallet1.info?.name as string);
    expect(wallet).toBe(wallets[0]);
  });

  it('should get chain by name', () => {
    const chain = walletManager.getChainByName(chain1.chainName);
    expect(chain).toBe(chains[0]);
  });

  it('should get asset list by name', () => {
    const assetList = walletManager.getAssetListByName(chain1.chainName);
    expect(assetList).toBe(assetLists[0]);
  });

  it('should connect to a wallet', async () => {
    wallet1.connect = jest.fn();
    wallet2.connect = jest.fn();
    await walletManager.connect(wallet1.info?.name as string, chain1.chainName as string);
    expect(wallets[0].connect).toHaveBeenCalledWith(chain1.chainId);
  });

  it('should throw error if wallet does not exist', async () => {
    await expect(walletManager.connect('wallet-3', 'chain-1')).rejects.toThrow(WalletNotExist);
  });

  it('should throw error if chain does not exist', async () => {
    await expect(walletManager.connect('wallet-1', 'chain-3')).rejects.toThrow(ChainNameNotExist);
  });

  it('should disconnect from a wallet', async () => {
    wallet1.disconnect = jest.fn();
    await walletManager.disconnect(wallet1.info?.name as string, chain1.chainName as string);
    expect(wallets[0].disconnect).toHaveBeenCalledWith('1');
  });

  it('should get account from a wallet', () => {
    wallet1.getAccount = jest.fn();
    walletManager.getAccount('wallet-1', 'chain-1');
    expect(wallets[0].getAccount).toHaveBeenCalledWith('1');
  });

  it('should get right account from a wallet', () => {
    const mockAccount1 = createMockAccount('mockAccount1');
    wallet1.getAccount = jest.fn().mockReturnValue(Promise.resolve(mockAccount1));
    walletManager.getAccount(wallet1.info?.name as string, chain1.chainName);
    expect(wallets[0].getAccount(chain1.chainId as string)).resolves.toBe(mockAccount1);
  });

  it('should get RPC endpoint', async () => {
    const rpcEndpoint = await walletManager.getRpcEndpoint('wallet-1', 'chain-1');
    expect(rpcEndpoint).toBe('http://localhost:26657');
  });

  it('should throw error if no valid RPC endpoint found', async () => {
    if (walletManager.endpointOptions?.endpoints?.['chain-1']) {
      walletManager.endpointOptions.endpoints['chain-1'].rpc = [];
    }

    if (walletManager.chains[0].apis) {
      walletManager.chains[0].apis.rpc = [];
    }
    await expect(walletManager.getRpcEndpoint('wallet-1', 'chain-1')).rejects.toThrow(NoValidRpcEndpointFound);
  });

  it('should get preferred sign type', () => {
    const signType1 = walletManager.getPreferSignType(chain1.chainName);
    expect(signType1).toBe('amino');

    const signType2 = walletManager.getPreferSignType(chain2.chainName);
    expect(signType2).toBe('direct');
  });

  it('should get signer options', () => {
    const options = walletManager.getSignerOptions(chain1.chainName);
    expect(options.signerOptions?.prefix).toBe(signerOptions.signing?.(chain1.chainName as string)?.signerOptions?.prefix);
  });

  it('should get signing client', async () => {
    SigningClient.connectWithSigner = jest.fn();
    const mockAminoOfflineSigner = new AminoGenericOfflineSigner({
      getAccounts: jest.fn(),
      signAmino: jest.fn()
    })
    const mockSignerOption = signerOptions.signing?.(chain1.chainName as string)
    const mockRpcEndpoint = 'http://localhost:26657';

    walletManager.getOfflineSigner = jest.fn().mockReturnValue(Promise.resolve(mockAminoOfflineSigner));
    walletManager.getSignerOptions = jest.fn().mockReturnValue(mockSignerOption);
    walletManager.getRpcEndpoint = jest.fn().mockReturnValue(Promise.resolve(mockRpcEndpoint));

    await walletManager.getSigningClient(wallet1.info?.name as string, chain1.chainName as string);

    expect(SigningClient.connectWithSigner).toHaveBeenCalledWith(mockRpcEndpoint, mockAminoOfflineSigner, mockSignerOption);
  });

  it('should get environment info', () => {
    const env = walletManager.getEnv();
    expect(env.browser).toBe('mozilla');
    expect(env.device).toBe('desktop');
    expect(env.os).toBe('windows');
  });

  it('should get download link', () => {
    wallets[0].info.downloads = [{
      device: 'desktop', browser: 'chrome',
      link: 'i am download link'
    }];
    walletManager.getEnv = jest.fn().mockReturnValue({ browser: 'chrome', device: 'desktop' });
    const downloadLink = walletManager.getDownloadLink('wallet-1');
    expect(downloadLink?.link).toEqual('i am download link');
  });

  it('should return undefined if chain does not exist', () => {
    const chain = walletManager.getChainByName('non-existent-chain');
    expect(chain).toBeUndefined();
  });

  it('should return undefined if chain does not exist', () => {
    const chain = walletManager.getChainByName('non-existent-chain');
    expect(chain).toBeUndefined();
  });

  it('new chains should be added into chainMaps of wallet, after addChains', () => {
    const newChain = createMockChain({ chainName: 'chainToAdd', chainId: '3', rpcEndpoint: [{ address: 'http://localhost:26659' }], chainType: 'cosmos' });
    const newAssetList = createMockAssetList({ chainName: 'chainToAdd', assets: [] });
    walletManager.addChains([newChain], [newAssetList], signerOptions, endpointOptions);
    expect(wallet1.chainMap.get(newChain.chainId)).toEqual(newChain);
    expect(wallet2.chainMap.get(newChain.chainId)).toEqual(newChain);
  })

});


