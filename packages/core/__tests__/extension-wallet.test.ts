import { BroadcastMode, SignOptions, Wallet } from '../src/types';
import { StdSignDoc } from '@interchainjs/types';
import { clientNotExistError, getClientFromExtension } from '../src/utils';
import { ExtensionWallet } from './../src/extension-wallet';
import { Chain, AssetList } from '@chain-registry/v2-types';
import Long from 'long';
import { DirectSignDoc } from '../src/types';



jest.mock('../src/utils', () => ({
  ...jest.requireActual('../src/utils'),
  getClientFromExtension: jest.fn(),
  clientNotExistError: jest.fn()
}));

describe('ExtensionWallet', () => {
  let wallet: ExtensionWallet;
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      enable: jest.fn(),
      disable: jest.fn(),
      getKey: jest.fn(),
      getOfflineSignerOnlyAmino: jest.fn(),
      getOfflineSigner: jest.fn(),
      signAmino: jest.fn(),
      signArbitrary: jest.fn(),
      verifyArbitrary: jest.fn(),
      signDirect: jest.fn(),
      sendTx: jest.fn(),
      experimentalSuggestChain: jest.fn(),
    };

    (getClientFromExtension as jest.Mock).mockResolvedValue(mockClient);

    wallet = new ExtensionWallet({ name: 'wallet-name', mode: 'extension', prettyName: 'pretty-name-value', windowKey: 'window-key-value' });
  });

  it('should initialize the wallet with provided options', () => {
    const options: Wallet = { name: 'wallet-name', mode: 'extension', prettyName: 'pretty-name-value', windowKey: 'window-key-value' };
    wallet = new ExtensionWallet(options);
    expect(wallet.info).toEqual(options);
  });

  it('should initialize the wallet with default options', () => {
    wallet = new ExtensionWallet();
    expect(wallet.info).toEqual(undefined);
  });


  it('should initialize the wallet and set client', async () => {
    await wallet.init();
    expect(wallet.client).toBe(mockClient);
    expect(getClientFromExtension).toHaveBeenCalledWith('window-key-value');
    expect(wallet.isExtensionInstalled).toBe(true);
  });

  it('should handle client not existing during initialization', async () => {
    (getClientFromExtension as jest.Mock).mockRejectedValue(clientNotExistError.message);
    await wallet.init();
    expect(wallet.isExtensionInstalled).toBe(false);
  });

  it('should connect to the client', async () => {
    wallet.client = mockClient;
    await wallet.connect('chain-id');
    expect(mockClient.enable).toHaveBeenCalledWith('chain-id');
  });

  it('should disconnect from the client', async () => {
    wallet.client = mockClient;
    await wallet.disconnect('chain-id');
    expect(mockClient.disable).toHaveBeenCalledWith('chain-id');
  });

  it('should get a simple account', async () => {
    wallet.client = mockClient;
    const mockAccount = { name: 'username', bech32Address: 'address', algo: 'algo', pubKey: new Uint8Array(), isNanoLedger: false };
    mockClient.getKey.mockResolvedValue(mockAccount);

    const account = await wallet.getSimpleAccount('chain-id');
    expect(account).toEqual({
      namespace: 'cosmos',
      chainId: 'chain-id',
      address: 'address',
      username: 'username',
    });
  });

  it('should get an account', async () => {
    wallet.client = mockClient;
    const mockAccount = { name: 'username', bech32Address: 'address', algo: 'algo', pubKey: new Uint8Array(), isNanoLedger: false };
    mockClient.getKey.mockResolvedValue(mockAccount);

    const account = await wallet.getAccount('chain-id');
    expect(account).toEqual({
      username: 'username',
      address: 'address',
      algo: 'algo',
      pubkey: new Uint8Array(),
      isNanoLedger: false,
    });
  });

  it('should get multiple accounts', async () => {
    wallet.client = mockClient;
    const mockAccount = { name: 'username', bech32Address: 'address', algo: 'algo', pubKey: new Uint8Array(), isNanoLedger: false };
    mockClient.getKey.mockResolvedValueOnce(mockAccount).mockResolvedValueOnce(mockAccount);

    const accounts = await wallet.getAccounts(['chain-id1', 'chain-id2']);
    expect(accounts).toEqual([
      {
        username: 'username',
        address: 'address',
        algo: 'algo',
        pubkey: new Uint8Array(),
        isNanoLedger: false,
      },
      {
        username: 'username',
        address: 'address',
        algo: 'algo',
        pubkey: new Uint8Array(),
        isNanoLedger: false,
      },
    ]);
  });

  it('should get offline signer', () => {
    wallet.client = mockClient;
    wallet.getOfflineSigner('chain-id', 'amino');
    expect(mockClient.getOfflineSignerOnlyAmino).toHaveBeenCalledWith('chain-id');

    wallet.getOfflineSigner('chain-id', 'direct');
    expect(mockClient.getOfflineSigner).toHaveBeenCalledWith('chain-id');
  });

  it('should sign amino', async () => {
    wallet.client = mockClient;
    const signDoc: StdSignDoc = { msgs: [], fee: { amount: [], gas: '0' }, chain_id: 'chain-id', memo: '', account_number: '0', sequence: '0' };
    const signOptions: SignOptions = {
      preferNoSetFee: false,
      preferNoSetMemo: true,
      disableBalanceCheck: true,
    };
    await wallet.signAmino('chain-id', 'signer', { ...signDoc, fee: { ...signDoc.fee, amount: [...signDoc.fee.amount] }, msgs: signDoc.msgs as any[] }, signOptions);
    expect(mockClient.signAmino).toHaveBeenCalledWith('chain-id', 'signer', signDoc, signOptions);
  });

  it('should sign arbitrary', async () => {
    wallet.client = mockClient;
    const data = 'data';
    await wallet.signArbitrary('chain-id', 'signer', data);
    expect(mockClient.signArbitrary).toHaveBeenCalledWith('chain-id', 'signer', data);
  });

  it('should verify arbitrary', async () => {
    wallet.client = mockClient;
    const data = 'data';
    await wallet.verifyArbitrary('chain-id', 'signer', data);
    expect(mockClient.verifyArbitrary).toHaveBeenCalledWith('chain-id', 'signer', data);
  });

  it('should sign direct', async () => {
    wallet.client = mockClient;
    const signDoc: DirectSignDoc = { bodyBytes: new Uint8Array(), authInfoBytes: new Uint8Array(), chainId: 'chain-id', accountNumber: BigInt(0) };
    const signOptions = {
      preferNoSetFee: false,
      preferNoSetMemo: true,
      disableBalanceCheck: true,
    };
    await wallet.signDirect('chain-id', 'signer', signDoc, signOptions);
    expect(mockClient.signDirect).toHaveBeenCalledWith('chain-id', 'signer', { ...signDoc, accountNumber: signDoc.accountNumber ? Long.fromString(signDoc.accountNumber.toString()) : Long.ZERO }, signOptions);
  });

  it('should send transaction', async () => {
    wallet.client = mockClient;
    const tx = new Uint8Array();
    await wallet.sendTx('chain-id', tx, { Block: 'block' } as any);
    expect(mockClient.sendTx).toHaveBeenCalledWith('chain-id', tx, { Block: 'block' } as any);
  });

  it('should add suggest chain', async () => {
    wallet.client = mockClient;
    const chain = { chain_id: 'chain-id', chain_name: 'chain-name' } as unknown as Chain;
    const assetLists: AssetList[] = [];
    await wallet.addSuggestChain(chain, assetLists);
    expect(mockClient.experimentalSuggestChain).toHaveBeenCalled();
  });
});
