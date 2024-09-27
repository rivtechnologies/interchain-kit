import { AssetList } from "@chain-registry/v2-types";

export const getChainLogoUrl = (assetList: AssetList): string | undefined => {
  return assetList.assets?.[0].logoURIs.png || assetList.assets?.[0].logoURIs.svg || undefined
}