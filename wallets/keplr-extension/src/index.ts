import { ExtensionWallet } from "@interchain-kit/core";
import { keplrExtensionInfo } from "./registry";

export * from './registry'

const keplrWallet = new ExtensionWallet(keplrExtensionInfo);

export { keplrWallet }