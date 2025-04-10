import { EthereumWallet, ExtensionWallet } from "@interchain-kit/core";
import { exodusExtensionInfo } from "./registry";

const exodusWallet = new ExtensionWallet(exodusExtensionInfo);

class ExodusWallet extends EthereumWallet {

}

exodusWallet.setNetworkWallet('eip155', new ExodusWallet(exodusExtensionInfo));

export { exodusWallet };