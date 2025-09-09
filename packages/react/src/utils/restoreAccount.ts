import { WalletAccount } from '@interchain-kit/core';

export const restoreAccountFromLocalStorage = (walletAccount: WalletAccount) => {

  const pubkey = walletAccount.pubkey;


  if (typeof pubkey === 'object') {
    // return from localstorage need to restructure to uinit8Array
    return { ...walletAccount, pubkey: Uint8Array.from({ ...pubkey, length: Object.keys(pubkey).length }) };
  }


  return walletAccount;
};