import { KeplrWallet } from "./extension";
import { keplrExtensionInfo } from "./registry";

const keplrWallet = new KeplrWallet({ option: keplrExtensionInfo });

export { keplrWallet }