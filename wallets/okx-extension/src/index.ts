import { OkxWallet } from "./extension"
import { OkxwalletExtensionInfo } from "./registry"

const okxWallet = new OkxWallet(OkxwalletExtensionInfo)

export { okxWallet }