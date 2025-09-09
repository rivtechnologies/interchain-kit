
import { WalletManager } from '@interchain-kit/core';
import { keplrWallet } from '@interchain-kit/keplr-extension';
import cosmoshub from 'chain-registry/mainnet/cosmoshub';
import osmosis from 'chain-registry/mainnet/osmosis';

const walletManager = await WalletManager.create(
  [osmosis.chain, cosmoshub.chain],
  [osmosis.assetList, cosmoshub.assetList],
  [keplrWallet]);

// return account of osmosis chain from keplr wallet extension
const account = await walletManager.getAccount(keplrWallet.info?.name as string, osmosis.chain.chainName);
console.log(account);
// return account of cosmoshub chain from keplr wallet extension
const account2 = await walletManager.getAccount(keplrWallet.info?.name as string, cosmoshub.chain.chainName);
console.log(account2);
