import { Asset, Chain } from "@chain-registry/types";
import { ChainInfo, Currency } from '@keplr-wallet/types';
export const makeKeplrChainInfo = (chain: Chain, asset: Asset, rpc: string, rest: string, chainId: string, chainName: string): ChainInfo => {
  const currency: Currency = {
    coinDenom: asset.symbol,
    coinMinimalDenom: asset.base,
    coinDecimals:
      asset.denomUnits.find(({ denom }) => denom === asset.display)
        ?.exponent ?? 6,
    coinGeckoId: asset.coingeckoId,
    coinImageUrl:
      asset.logoURIs?.svg ||
      asset.logoURIs?.png ||
      asset.logoURIs?.svg ||
      '',
  };

  return {
    rpc: rpc ?? '',
    rest: rest ?? '',
    chainId: chainId,
    chainName: chainName,
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: chain.bech32Prefix,
      bech32PrefixAccPub: chain.bech32Prefix + 'pub',
      bech32PrefixValAddr: chain.bech32Prefix + 'valoper',
      bech32PrefixValPub: chain.bech32Prefix + 'valoperpub',
      bech32PrefixConsAddr: chain.bech32Prefix + 'valcons',
      bech32PrefixConsPub: chain.bech32Prefix + 'valconspub',
    },
    currencies: [currency],
    feeCurrencies: [
      {
        ...currency,
        gasPriceStep: {
          low: chain.fees?.feeTokens[0].lowGasPrice ?? 0.0025,
          average: chain.fees?.feeTokens[0].averageGasPrice ?? 0.025,
          high: chain.fees?.feeTokens[0].highGasPrice ?? 0.04,
        },
      },
    ],
    stakeCurrency: currency,
  };
};