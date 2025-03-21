import { CosmosWallet, EthereumWallet, MultiChainWallet } from "@interchain-kit/core";
import { keplrExtensionInfo } from "./registry";

export * from './registry'

const keplrWallet = new MultiChainWallet(keplrExtensionInfo)

class KeplrEthereumWallet extends EthereumWallet {
    async connect(chainId: string) {
        console.log('chainId', Number(chainId).toString(16))
        await super.connect(Number(chainId).toString(16))
    }
}


keplrWallet.setNetworkWallet('cosmos', new CosmosWallet(keplrExtensionInfo))
keplrWallet.setNetworkWallet('eip155', new KeplrEthereumWallet(keplrExtensionInfo))

export { keplrWallet }