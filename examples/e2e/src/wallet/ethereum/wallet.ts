import { MultiChainWallet, Wallet } from "@interchain-kit/core";
import { MockEthereumWallet } from "@interchain-kit/mock-wallet";

const senderWalletInfo: Wallet = {
  name: "Mock Ethereum Wallet Sender",
  mode: "extension",
  prettyName: "Mock Ethereum Wallet Sender",
  keystoreChange: "accountChanged",
};

const mockEthereumWalletSender = new MultiChainWallet(senderWalletInfo);

const senderMnemonic = 'usual burden law job pledge pulse version trade link leave smooth speed';

const mockEthereumWalletSenderInstance = new MockEthereumWallet(senderWalletInfo, senderMnemonic);


mockEthereumWalletSender.setNetworkWallet('eip155', mockEthereumWalletSenderInstance)



const receiverWalletInfo: Wallet = {
  name: "Mock Ethereum Wallet Receiver",
  mode: "extension",
  prettyName: "Mock Ethereum Wallet Receiver",
  keystoreChange: "accountChanged",
};

const mockEthereumWalletReceiver = new MultiChainWallet(receiverWalletInfo);

const receiverMnemonic = 'similar lamp oppose depth urge wide business slush sibling distance bottom trial';

const mockEthereumWalletReceiverInstance = new MockEthereumWallet(receiverWalletInfo, receiverMnemonic);



mockEthereumWalletReceiver.setNetworkWallet('eip155', mockEthereumWalletReceiverInstance)

export {
  mockEthereumWalletSender,
  mockEthereumWalletReceiver
}