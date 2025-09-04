import { CosmosExtensionMetaMask } from './extension';
import { cosmosSnapExtensionInfo } from './registry';

export * from './constant';
export * from './extension';
export * from './registry';

const cosmosExtensionMetaMask = new CosmosExtensionMetaMask(cosmosSnapExtensionInfo);

export { cosmosExtensionMetaMask };