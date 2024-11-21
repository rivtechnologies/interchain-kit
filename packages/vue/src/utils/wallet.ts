import { BaseWallet } from '@interchain-kit/core';

export const getWalletInfo = (wallet: BaseWallet) => {
  return {
    name: wallet.info.name,
    prettyName: wallet.info.prettyName,
    logo: wallet.info.logo as string,
    mobileDisabled: true,
  };
};