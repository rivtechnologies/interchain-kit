import { MobileWallet } from "@interchain-kit/core";
import { LeapMobileInfo } from "./registry";

export class LeapMobile extends MobileWallet { }

const leapMobile = new LeapMobile(LeapMobileInfo);

export { leapMobile };