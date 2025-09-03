

import { useEffect } from 'react';

import { useInterchainWalletContext } from '../provider';
import { bindAllMethods } from '../utils/bindContext';
import { useForceUpdate } from './useForceUpdate';


export const useWalletManager = () => {
  const walletManager = useInterchainWalletContext();

  const forceUpdate = useForceUpdate();

  useEffect(() => {
    const unsubscribe = walletManager.subscribe(() => forceUpdate());
    return () => unsubscribe();
  }, []);

  const wmToReturn = bindAllMethods(walletManager);


  return wmToReturn;
};