import { WCCosmosWallet } from './wc-cosmos-wallet';
import { WCEthereumWallet } from './wc-ethereum-wallet';
import { WCSolanaWallet } from './wc-solana-wallet';
import { WCWallet } from './wc-wallet';

export * from './wc-common';
export * from './wc-cosmos-wallet';
export * from './wc-ethereum-wallet';
export * from './wc-solana-wallet';
export * from './wc-wallet';

// Create a default WalletConnect instance with all network wallets
const walletConnect = new WCWallet();

// Set up network-specific wallets
walletConnect.setNetworkWallet('cosmos', new WCCosmosWallet());
walletConnect.setNetworkWallet('eip155', new WCEthereumWallet());
walletConnect.setNetworkWallet('solana', new WCSolanaWallet());

export { walletConnect };