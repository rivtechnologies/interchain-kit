
export const createSignerOption = (chainName: string): any => {
  return {
    broadcast: {
      checkTx: true,
      deliverTx: true,
      timeoutMs: 20000
    },
    gasPrice: '0.025uatom',
    signerOptions: {
      prefix: chainName,
    }
  };
};