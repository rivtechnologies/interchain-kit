import { CosmosWallet, ExtensionWallet } from "@interchain-kit/core";
import { rivWalletExtensionInfo } from "./registry";

export * from './registry';

const rivWallet = new ExtensionWallet(rivWalletExtensionInfo);
rivWallet.setNetworkWallet('cosmos', new CosmosWallet(rivWalletExtensionInfo));

export { rivWallet };