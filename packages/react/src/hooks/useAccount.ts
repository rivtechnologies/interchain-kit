import { useEffect, useState } from "react"
import { useChain } from "./useChain"
import { useCurrentWallet } from "./useCurrentWallet"

export const useAccount = (chainName: string) => {
    const chain = useChain(chainName)

    const currentWallet = useCurrentWallet()

    const [account, setAccount] = useState({})

    const getAccount = async () => {
        const account = await currentWallet.getAccount(chain.chainId)
        setAccount(account)
    }

    useEffect(() => {
        if (currentWallet) {
            currentWallet.events.on('keystoreChange', getAccount)
        }
    }, [currentWallet])

    useEffect(() => {
        if (!currentWallet) {
            setAccount({})
            return
        }
        getAccount()
    }, [currentWallet, chainName, currentWallet?.walletState])

    return account
}