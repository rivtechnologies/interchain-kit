
import { Bip39, Random } from '@interchainjs/crypto';
import { MockCosmosWallet, MockMultiChainWallet } from "./mock-cosmos-wallet";
import { clientNotExistError, Wallet } from '@interchain-kit/core';

const mockWallet1Info: Wallet = {
  windowKey: "mock1",
  cosmosKey: "mockcosmos1",
  name: "mockWallet1",
  prettyName: "Mock Cosmos Wallet 1",
  mode: "extension",
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link: 'https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?hl=en',
    },
    {
      device: 'desktop',
      browser: 'firefox',
      link: 'https://addons.mozilla.org/en-US/firefox/addon/keplr/',
    },
    {
      link: 'https://www.keplr.app/download',
    },
  ],
}
const mockCosmosWallet1 = new MockCosmosWallet(
  mockWallet1Info,
  "mock1 mock1 mock1 mock1 mock1 mock1 mock1 mock1 mock1 mock1 mock1 mock1"
);

export const mockWallet1 = new MockMultiChainWallet(mockWallet1Info)
mockWallet1.setNetworkWallet('cosmos', mockCosmosWallet1)


const mockWallet2Info: Wallet = {
  windowKey: "mock2",
  cosmosKey: "mockcosmos2",
  name: "mockWallet2",
  prettyName: "Mock Cosmos Wallet 2",
  mode: "extension",
}
const mockCosmosWallet2 = new MockCosmosWallet(
  mockWallet2Info,
  "mock2 mock2 mock2 mock2 mock2 mock2 mock2 mock2 mock2 mock2 mock2 mock2"
);
export const mockWallet2 = new MockMultiChainWallet(mockWallet2Info)
mockWallet2.setNetworkWallet('cosmos', mockCosmosWallet2)


const sendWalletInfo: Wallet = {
  windowKey: "sender",
  cosmosKey: "sendercosmos",
  name: "senderWallet",
  prettyName: "Sender Wallet",
  mode: "extension",
}
const senderCosmosWallet = new MockCosmosWallet(
  sendWalletInfo,
  Bip39.encode(Random.getBytes(16)).toString()
)
export const senderWallet = new MockMultiChainWallet(sendWalletInfo)
senderWallet.setNetworkWallet('cosmos', senderCosmosWallet)

const receiverWalletInfo: Wallet = {
  windowKey: "receiver",
  cosmosKey: "receivercosmos",
  name: "receiverWallet",
  prettyName: "Receiver Wallet",
  mode: "extension",
}
const receiverCosmosWallet = new MockCosmosWallet(
  receiverWalletInfo,
  Bip39.encode(Random.getBytes(16)).toString()
);
export const receiverWallet = new MockMultiChainWallet(receiverWalletInfo)
receiverWallet.setNetworkWallet('cosmos', receiverCosmosWallet)


export const NotInstalledWallet: Wallet = {
  name: "notInstalledWallet",
  prettyName: "Not Installed Wallet",
  mode: "extension",
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link: 'http://show-not-installed-wallet.link',
    },
  ]
}

export const notInstalledWallet = new MockMultiChainWallet(NotInstalledWallet);
notInstalledWallet.init = () => {
  throw clientNotExistError
}