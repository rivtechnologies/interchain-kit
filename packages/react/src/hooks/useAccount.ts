import { useEffect, useState } from "react"
import { useWalletManager } from "./useWalletManager"

export const useAccount = () => {

    const walletManager = useWalletManager()

    const currentWallet = walletManager.getActiveWallet()

    const [account, setAccount] = useState({})

    const getAccount = async () => {
        const account = await currentWallet.getAccount(walletManager.chains.map(chain => chain.chainId)[0])
        setAccount(account)
    }


    useEffect(() => {
        if (!currentWallet) {
            setAccount({})
            return
        }

        currentWallet.events.on('keystoreChange', getAccount)

        getAccount()
    }, [currentWallet])


    return account
}