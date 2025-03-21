import { AssetList } from "@chain-registry/v2-types";

export const createMockAssetList = (info: AssetList): AssetList => {
  const mockAssetList: AssetList = {
    chainName: info.chainName,
    assets: info.assets
  }
  return mockAssetList
}