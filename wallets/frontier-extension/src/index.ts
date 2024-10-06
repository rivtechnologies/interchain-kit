import { FrontierExtension } from './extension';
import { frontierExtensionInfo } from "./registry";

export * from './extension'
export * from './registry'

const frontierWallet = new FrontierExtension(frontierExtensionInfo);

export { frontierWallet }