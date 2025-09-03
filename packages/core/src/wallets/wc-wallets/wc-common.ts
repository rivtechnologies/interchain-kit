import UniversalProvider from '@walletconnect/universal-provider';
import { WCWallet } from './wc-wallet';


export interface IWCCommon {
  setWCProvider(provider: UniversalProvider): void;
  getWCProvider(): UniversalProvider;
  setWCWallet(wallet: WCWallet): void;
  getWCWallet(): WCWallet;
}


export const isWCCommon = (wallet: any): wallet is IWCCommon => {
  return wallet.setWCProvider && wallet.getWCProvider;
}