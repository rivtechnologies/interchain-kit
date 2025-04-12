import { CosmosWallet, ExtensionWallet } from "@interchain-kit/core";
import { FinExtensionInfo } from "./registry";

const finWallet = new ExtensionWallet(FinExtensionInfo)

finWallet.setNetworkWallet('cosmos', new CosmosWallet(FinExtensionInfo))

export { finWallet }