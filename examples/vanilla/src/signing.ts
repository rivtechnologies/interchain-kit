
import { assetLists, chains } from '@chain-registry/v2';
import { WalletManager } from '@interchain-kit/core';
import { keplrWallet } from '@interchain-kit/keplr-extension';

const chainName = 'osmosistestnet'
const walletName = 'keplr-extension'

const start = async () => {

    const _chains = chains.filter(c => c.chainName === chainName)
    const _assetLists = assetLists.filter(c => c.chainName === chainName)
    const _wallets = [keplrWallet]

    const wm = await WalletManager.create(_chains, _assetLists, _wallets)

    const cosmosSigningClient = await wm.getSigningCosmosClient(walletName, chainName)

    const signerAccount = await wm.getAccount(walletName, chainName)

    const receiveAddress = 'osmo10m5gpakfe95t5k86q5fhqe03wuev7g3ac2lvcu'

    const fee = {
        amount: [
            {
                denom: 'uosmo',
                amount: '2500',
            },
        ],
        gas: '550000',
    };

    const token = {
        amount: '1000',
        denom: 'uosmo',
    };

    const message = { fromAddress: signerAccount.address, toAddress: receiveAddress, amount: [token] }

    await cosmosSigningClient.helpers.send(signerAccount.address, message, fee, 'hello world')

}

start()