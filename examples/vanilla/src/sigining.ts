
import { chain as osmosisChain, assetList as osmosisAssetList } from '@chain-registry/v2/mainnet/osmosis';
import { WalletManager } from '@interchain-kit/core';
import { keplrWallet } from '@interchain-kit/keplr-extension';
import { createSend } from "interchainjs/cosmos/bank/v1beta1/tx.rpc.func";

const walletManager = await WalletManager.create(
  [osmosisChain],
  [osmosisAssetList],
  [keplrWallet])

const signingClient = await walletManager.getSigningClient(keplrWallet.info?.name as string, osmosisChain.chainName)
const account = await walletManager.getAccount(keplrWallet.info?.name as string, osmosisChain.chainName)
const txSend = createSend(signingClient);

const denom = osmosisChain.staking?.stakingTokens[0].denom as string

const fromAddress = account.address

const fee = {
  amount: [{
    denom,
    amount: '25000'
  }],
  gas: "1000000",
};

const message = {
  fromAddress: fromAddress,
  toAddress: 'osmo10m5gpakfe95t5k86q5fhqe03wuev7g3ac2lvcu',
  amount: [
    {
      denom,
      amount: '1'
    },
  ],
}

const memo = "test"

await txSend(
  fromAddress,
  message,
  fee,
  memo
)

// pop up confirm modal from wallet