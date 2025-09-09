
import { WalletManager } from '@interchain-kit/core';
import { keplrWallet } from '@interchain-kit/keplr-extension';
import { assetList as osmosisAssetList,chain as osmosisChain } from 'chain-registry/mainnet/osmosis';
import { createGetBalance } from 'interchainjs/cosmos/bank/v1beta1/query.rpc.func';

const walletManager = await WalletManager.create(
  [osmosisChain],
  [osmosisAssetList],
  [keplrWallet]);

const account = await walletManager.getAccount(keplrWallet.info?.name as string, osmosisChain.chainName);
const osmosisRpcEndpoint = await walletManager.getRpcEndpoint(keplrWallet.info?.name as string, osmosisChain.chainName);

const balanceQuery = createGetBalance(osmosisRpcEndpoint as string);
const { balance } = await balanceQuery({
  address: account.address,
  denom: osmosisChain.staking?.stakingTokens[0].denom as string,
});

console.log(balance);

/**
 * { amount: '26589633', denom: 'uosmo' }
 */