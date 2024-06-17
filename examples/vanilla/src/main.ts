import { OfflineAminoSigner } from '@cosmjs/amino';
import { keplrWallet } from '@interchain-kit/keplr-extension'




try {
    await keplrWallet.init()

    const account = await keplrWallet.getAccount('juno-1')
    console.log(account)

    keplrWallet.getSimpleAccount('juno-1').then((account) => {
        console.log(account)
    })

    const OfflineAminoSigner = keplrWallet.getOfflineSignerAmino('juno-1')

    console.log(await OfflineAminoSigner.getAccounts())

    await keplrWallet.disable('juno-1')
} catch (error) {
    console.log(error)
}

