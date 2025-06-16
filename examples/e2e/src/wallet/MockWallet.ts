import { Wallet } from "@interchain-kit/core";
import { MockCosmosWallet, MockMultiChainWallet } from "./mock-cosmos-wallet";

const mockWalletInfo: Wallet = {
  windowKey: "mock",
  cosmosKey: "mockcosmos",
  name: "mockWallet",
  prettyName: "Mock Wallet",
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
const mockCosmosWallet = new MockCosmosWallet(
  mockWalletInfo,
  "mock1 mock1 mock1 mock1 mock1 mock1 mock1 mock1 mock1 mock1 mock1 mock1"
);

export const mockWallet = new MockMultiChainWallet(mockWalletInfo)
mockWallet.setNetworkWallet('cosmos', mockCosmosWallet)

