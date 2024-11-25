import { LeapCosmosExtensionMetaMask } from "./extension";
import { metamaskLeapCosmosSnapInfo } from "./registry";

export * from './constant'
export * from './extension'
export * from './registry'

const leapCosmosExtensionMetaMask = new LeapCosmosExtensionMetaMask(metamaskLeapCosmosSnapInfo)

export { leapCosmosExtensionMetaMask }