
import { assetLists, chains } from '@chain-registry/v2';
import { WalletManager } from '@interchain-kit/core';
import { keplrWallet } from '@interchain-kit/keplr-extension';

const chainName = 'osmosis'
const walletName = 'keplr-extension'

const start = async () => {

    const _chains = chains.filter(c => c.chainName === chainName)
    const _assetLists = assetLists.filter(c => c.chainName === chainName)
    const _wallets = [keplrWallet]

    const wm = await WalletManager.create(_chains, _assetLists, _wallets)

    const queryClient = await wm.getQueryClient(walletName, chainName)

    const account = await wm.getAccount(walletName, chainName)

    const { balance } = await queryClient.balance({ address: account.address, denom: 'uosmo' })

    console.log(`i have ${balance?.amount}${balance?.denom} in ${chainName}`)
}

start()