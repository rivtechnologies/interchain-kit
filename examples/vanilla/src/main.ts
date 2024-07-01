import { keplrmobile } from './../../../wallets/keplr-mobile/src/registry';

import { OfflineAminoSigner } from '@cosmjs/amino';
import { keplrWallet } from '@interchain-kit/keplr-extension'
import { keplrMobile } from '@interchain-kit/keplr-mobile'
import QRCode from 'qrcode'

const startConnectMobile = async () => {
    try {
        await keplrMobile.init()
        const onApprove = async () => {
            console.log('connected')
            console.log(keplrMobile.session)
            console.log(keplrMobile.getAccounts())
            console.log(await keplrMobile.getAccount('juno-1'))
        }

        const onGenerateParingUri = async (uri: string) => {

            console.log(uri)
            QRCode.toCanvas(document.getElementById('canvas'), uri, function (error) {
                if (error) console.error(error)
                console.log('success!');
            })
        }

        await keplrMobile.connect(['juno-1', 'cosmoshub-4'], onApprove, onGenerateParingUri)


    } catch (error) {
        console.log(error)
    }
}

const startConnectKeplrWallet = async () => {
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
}


startConnectKeplrWallet()
// startConnectMobile()