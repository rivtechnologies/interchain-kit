import { XdefiWallet } from "./extension";
import { xdefiExtensionInfo } from "./registry";

const xdefiWallet = new XdefiWallet(xdefiExtensionInfo)

export * from './constant'
export * from './registry'

export { xdefiWallet }
