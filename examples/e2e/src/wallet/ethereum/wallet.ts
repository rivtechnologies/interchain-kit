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

// Add Sepolia network support
mockEthereumWalletSenderInstance.addNetwork({
  chainId: 11155111,
  name: 'Sepolia Testnet',
  rpcUrl: 'https://eth-sepolia.public.blastapi.io',
  blockExplorer: 'https://sepolia.etherscan.io',
  currencySymbol: 'ETH',
  currencyDecimals: 18
});

// Set Sepolia as the default network by modifying the currentChainId
(mockEthereumWalletSenderInstance as any).currentChainId = 11155111;

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

// Add Sepolia network support
mockEthereumWalletReceiverInstance.addNetwork({
  chainId: 11155111,
  name: 'Sepolia Testnet',
  rpcUrl: 'https://eth-sepolia.public.blastapi.io',
  blockExplorer: 'https://sepolia.etherscan.io',
  currencySymbol: 'ETH',
  currencyDecimals: 18
});

// Set Sepolia as the default network by modifying the currentChainId
(mockEthereumWalletReceiverInstance as any).currentChainId = 11155111;

mockEthereumWalletReceiver.setNetworkWallet('eip155', mockEthereumWalletReceiverInstance)

export {
  mockEthereumWalletSender,
  mockEthereumWalletReceiver
}