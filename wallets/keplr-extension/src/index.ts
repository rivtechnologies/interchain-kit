import { KeplrWallet } from "./extension";
import { keplrExtensionInfo } from "./registry";

const keplrWallet = new KeplrWallet(keplrExtensionInfo);

export { keplrWallet }