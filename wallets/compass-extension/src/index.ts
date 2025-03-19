import { CompassExtension } from "./extension";
import { compassExtensionInfo } from "./registry";


const compassWallet = new CompassExtension(compassExtensionInfo);

export { compassWallet }