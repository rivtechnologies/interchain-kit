import { CosmosWallet, EthereumWallet, ExtensionWallet } from "@interchain-kit/core";
import { exodusExtensionInfo } from "./registry";

const exodusWallet = new ExtensionWallet(exodusExtensionInfo);

exodusWallet.setNetworkWallet('eip155', new EthereumWallet(exodusExtensionInfo));
exodusWallet.setNetworkWallet('cosmos', new CosmosWallet(exodusExtensionInfo));

export { exodusWallet };