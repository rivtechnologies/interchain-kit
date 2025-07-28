import { WCMobileWebWallet } from "@interchain-kit/core";
import { rivWalletMobileInfo } from "./registry";

export * from './registry';

const rivWallet = new WCMobileWebWallet(rivWalletMobileInfo);

export { rivWallet };