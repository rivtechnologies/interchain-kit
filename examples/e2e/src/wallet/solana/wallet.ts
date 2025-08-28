import { MultiChainWallet, Wallet } from "@interchain-kit/core";
import { MockMultiChainWallet } from "../mock-cosmos-wallet";
import { MockSolanaWallet } from "@interchain-kit/mock-wallet";


const senderWalletInfo: Wallet = {
  name: 'Mock Solana Wallet Sender',
  mode: 'extension',
  prettyName: 'Mock Solana Wallet Sender',
  keystoreChange: 'accountChanged',
}

const mockSolanaWalletSender = new MultiChainWallet(senderWalletInfo);

const senderMnemonic = 'faint angry hamster average borrow urge quality execute farm split brand canoe';

mockSolanaWalletSender.setNetworkWallet('solana', new MockSolanaWallet('devnet', senderWalletInfo, senderMnemonic))

const receiveWalletInfo: Wallet = {
  name: 'Mock Solana Wallet Receiver',
  mode: 'extension',
  prettyName: 'Mock Solana Wallet Receiver',
  keystoreChange: 'accountChanged',
}

const mockSolanaWalletReceiver = new MultiChainWallet(receiveWalletInfo);

const receiverMnemonic = 'steak trade rack impact wall chaos cheese plate combine rich aerobic stuff';

mockSolanaWalletReceiver.setNetworkWallet('solana', new MockSolanaWallet('devnet', receiveWalletInfo, receiverMnemonic))


export {
  mockSolanaWalletSender,
  mockSolanaWalletReceiver
}