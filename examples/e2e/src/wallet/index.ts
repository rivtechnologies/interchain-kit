
import { Wallet } from '@interchain-kit/core';
import { Bip39, Random } from '@interchainjs/crypto';

import { MockCosmosWallet, MockMultiChainWallet } from './mock-cosmos-wallet';


const mockWallet2Info: Wallet = {
  windowKey: 'mock2',
  cosmosKey: 'mockcosmos2',
  name: 'mockWallet2',
  prettyName: 'Mock Cosmos Wallet 2',
  mode: 'extension',
};
const mockCosmosWallet2 = new MockCosmosWallet(
  mockWallet2Info,
  'mock2 mock2 mock2 mock2 mock2 mock2 mock2 mock2 mock2 mock2 mock2 mock2'
);
export const mockWallet2 = new MockMultiChainWallet(mockWallet2Info);
mockWallet2.setNetworkWallet('cosmos', mockCosmosWallet2);


const sendWalletInfo: Wallet = {
  windowKey: 'sender',
  cosmosKey: 'sendercosmos',
  name: 'senderWallet',
  prettyName: 'Sender Wallet',
  mode: 'extension',
};
const senderCosmosWallet = new MockCosmosWallet(
  sendWalletInfo,
  Bip39.encode(Random.getBytes(16)).toString()
);
export const senderWallet = new MockMultiChainWallet(sendWalletInfo);
senderWallet.setNetworkWallet('cosmos', senderCosmosWallet);

const receiverWalletInfo: Wallet = {
  windowKey: 'receiver',
  cosmosKey: 'receivercosmos',
  name: 'receiverWallet',
  prettyName: 'Receiver Wallet',
  mode: 'extension',
};
const receiverCosmosWallet = new MockCosmosWallet(
  receiverWalletInfo,
  Bip39.encode(Random.getBytes(16)).toString()
);
export const receiverWallet = new MockMultiChainWallet(receiverWalletInfo);
receiverWallet.setNetworkWallet('cosmos', receiverCosmosWallet);

