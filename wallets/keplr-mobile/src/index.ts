
import { MobileWallet } from "@interchain-kit/core";
import { keplrMobileInfo } from "./registry";


export class KeplrMobile extends MobileWallet { }

const keplrMobile = new KeplrMobile(keplrMobileInfo);

export { keplrMobile };