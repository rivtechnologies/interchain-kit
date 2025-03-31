import { BaseWallet, WCWallet } from '@interchain-kit/core';

export class MockWallet extends BaseWallet {
  init = jest.fn()
  connect = jest.fn()
  disconnect = jest.fn()
  getAccount = jest.fn()
  getOfflineSigner = jest.fn();
  addSuggestChain = jest.fn()
  getProvider = jest.fn();
}

export class MockWalletConnect extends WCWallet { }