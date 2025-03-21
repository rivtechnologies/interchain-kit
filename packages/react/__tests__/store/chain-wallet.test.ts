import { ChainWallet } from "../../src/store/chain-wallet";
import { BaseWallet, WalletAccount, SimpleAccount, DirectSignDoc, SignOptions, BroadcastMode } from "@interchain-kit/core";
import { Chain, AssetList } from "@chain-registry/v2-types";
import { OfflineSigner, OfflineAminoSigner, OfflineDirectSigner, AminoSignResponse, StdSignature, DirectSignResponse } from "@interchainjs/cosmos/types/wallet";
import { StdSignDoc } from "@interchainjs/types";

class MockWallet extends BaseWallet {
  async init(meta?: unknown): Promise<void> { }
  async connect(chainId: string | string[]): Promise<void> { }
  async disconnect(chainId: string | string[]): Promise<void> { }
  async getAccount(chainId: string): Promise<WalletAccount> { return {} as WalletAccount; }
  async getAccounts(chainIds: string[]): Promise<WalletAccount[]> { return []; }
  async getSimpleAccount(chainId: string): Promise<SimpleAccount> { return {} as SimpleAccount; }
  getOfflineSigner(chainId: string): OfflineSigner { return {} as OfflineSigner; }
  getOfflineSignerAmino(chainId: string): OfflineAminoSigner { return {} as OfflineAminoSigner; }
  getOfflineSignerDirect(chainId: string): OfflineDirectSigner { return {} as OfflineDirectSigner; }
  async signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<AminoSignResponse> { return {} as AminoSignResponse; }
  async signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature> { return {} as StdSignature; }
  async verifyArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<boolean> { return true; }
  async signDirect(chainId: string, signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions): Promise<DirectSignResponse> { return {} as DirectSignResponse; }
  async sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array> { return new Uint8Array(); }
  async addSuggestChain(chain: Chain, assetLists: AssetList[]): Promise<void> { }
}

describe('ChainWallet', () => {
  let mockWallet: MockWallet;
  let chainWallet: ChainWallet<MockWallet>;

  let walletManagerConnectMock: jest.Mock = jest.fn();
  let walletManagerDisconnectMock: jest.Mock = jest.fn();
  let walletManagerGetAccountMock: jest.Mock = jest.fn();

  beforeEach(() => {
    mockWallet = new MockWallet();
    chainWallet = new ChainWallet(
      mockWallet,
      walletManagerConnectMock,
      walletManagerDisconnectMock,
      walletManagerGetAccountMock
    );
  });

  test('init should call originalWallet.init', async () => {
    const initSpy = jest.spyOn(mockWallet, 'init');
    await chainWallet.init();
    expect(initSpy).toHaveBeenCalled();
  });

  test('connect should call connectWithState', async () => {
    await chainWallet.connect('chain-id');
    expect(walletManagerConnectMock).toHaveBeenCalledWith('chain-id');
  });

  test('disconnect should call disconnectWithState', async () => {
    const disconnectSpy = jest.spyOn(mockWallet, 'disconnect');
    await chainWallet.disconnect('chain-id');
    expect(walletManagerDisconnectMock).toHaveBeenCalledWith('chain-id');
  });

  test('getAccount should call getAccountWithState', async () => {
    const getAccountSpy = jest.spyOn(mockWallet, 'getAccount');
    await chainWallet.getAccount('chain-id');
    expect(walletManagerGetAccountMock).toHaveBeenCalledWith('chain-id');
  });

  test('getAccounts should call originalWallet.getAccounts', async () => {
    const getAccountsSpy = jest.spyOn(mockWallet, 'getAccounts');
    await chainWallet.getAccounts(['chain-id']);
    expect(getAccountsSpy).toHaveBeenCalledWith(['chain-id']);
  });

  test('getSimpleAccount should call originalWallet.getSimpleAccount', async () => {
    const getSimpleAccountSpy = jest.spyOn(mockWallet, 'getSimpleAccount');
    await chainWallet.getSimpleAccount('chain-id');
    expect(getSimpleAccountSpy).toHaveBeenCalledWith('chain-id');
  });

  test('getOfflineSigner should call originalWallet.getOfflineSigner', () => {
    const getOfflineSignerSpy = jest.spyOn(mockWallet, 'getOfflineSigner');
    chainWallet.getOfflineSigner('chain-id');
    expect(getOfflineSignerSpy).toHaveBeenCalledWith('chain-id');
  });

  test('getOfflineSignerAmino should call originalWallet.getOfflineSignerAmino', () => {
    const getOfflineSignerAminoSpy = jest.spyOn(mockWallet, 'getOfflineSignerAmino');
    chainWallet.getOfflineSignerAmino('chain-id');
    expect(getOfflineSignerAminoSpy).toHaveBeenCalledWith('chain-id');
  });

  test('getOfflineSignerDirect should call originalWallet.getOfflineSignerDirect', () => {
    const getOfflineSignerDirectSpy = jest.spyOn(mockWallet, 'getOfflineSignerDirect');
    chainWallet.getOfflineSignerDirect('chain-id');
    expect(getOfflineSignerDirectSpy).toHaveBeenCalledWith('chain-id');
  });

  test('signAmino should call originalWallet.signAmino', async () => {
    const signAminoSpy = jest.spyOn(mockWallet, 'signAmino');
    await chainWallet.signAmino('chain-id', 'signer', {} as StdSignDoc);
    expect(signAminoSpy).toHaveBeenCalledWith('chain-id', 'signer', {} as StdSignDoc, undefined);
  });

  test('signArbitrary should call originalWallet.signArbitrary', async () => {
    const signArbitrarySpy = jest.spyOn(mockWallet, 'signArbitrary');
    await chainWallet.signArbitrary('chain-id', 'signer', 'data');
    expect(signArbitrarySpy).toHaveBeenCalledWith('chain-id', 'signer', 'data');
  });

  test('verifyArbitrary should call originalWallet.verifyArbitrary', async () => {
    const verifyArbitrarySpy = jest.spyOn(mockWallet, 'verifyArbitrary');
    await chainWallet.verifyArbitrary('chain-id', 'signer', 'data');
    expect(verifyArbitrarySpy).toHaveBeenCalledWith('chain-id', 'signer', 'data');
  });

  test('signDirect should call originalWallet.signDirect', async () => {
    const signDirectSpy = jest.spyOn(mockWallet, 'signDirect');
    await chainWallet.signDirect('chain-id', 'signer', {} as DirectSignDoc);
    expect(signDirectSpy).toHaveBeenCalledWith('chain-id', 'signer', {} as DirectSignDoc, undefined);
  });

  test('sendTx should call originalWallet.sendTx', async () => {
    const sendTxSpy = jest.spyOn(mockWallet, 'sendTx');
    await chainWallet.sendTx('chain-id', new Uint8Array(), BroadcastMode.Block);
    expect(sendTxSpy).toHaveBeenCalledWith('chain-id', new Uint8Array(), BroadcastMode.Block);
  });

  test('addSuggestChain should call originalWallet.addSuggestChain', async () => {
    const addSuggestChainSpy = jest.spyOn(mockWallet, 'addSuggestChain');
    await chainWallet.addSuggestChain({} as Chain, []);
    expect(addSuggestChainSpy).toHaveBeenCalledWith({} as Chain, []);
  });
});