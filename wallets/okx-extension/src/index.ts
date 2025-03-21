import { OkxwalletExtensionInfo } from "./registry"
import { CosmosWallet, EthereumWallet, MultiChainWallet } from '@interchain-kit/core';

const okxWallet = new MultiChainWallet(OkxwalletExtensionInfo)

okxWallet.setNetworkWallet('cosmos', new CosmosWallet(OkxwalletExtensionInfo))
okxWallet.setNetworkWallet('eip155', new EthereumWallet(OkxwalletExtensionInfo))

export { okxWallet }