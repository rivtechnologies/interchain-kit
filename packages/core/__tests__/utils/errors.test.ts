import { clientNotExistError, ChainNotExist, ChainNameNotExist, WalletNotExist, NoWalletConnectedYet, NoGasPriceFound, NoActiveWallet, NoValidRpcEndpointFound } from '../../src/utils/errors';

describe('Error Tests', () => {
  test('clientNotExistError should have correct message', () => {
    expect(clientNotExistError.message).toBe('Client not exist');
  });

  test('ChainNotExist should have correct message', () => {
    const error = new ChainNotExist('chain-1');
    expect(error.message).toBe('Chain chain-1 not exist, please add it first');
  });

  test('ChainNameNotExist should have correct message', () => {
    const error = new ChainNameNotExist('chainName-1');
    expect(error.message).toBe('Chain Name chainName-1 not exist, please add it first');
  });

  test('WalletNotExist should have correct message', () => {
    const error = new WalletNotExist('wallet-1');
    expect(error.message).toBe('Wallet wallet-1 not Exist, please add it first');
  });

  test('NoWalletConnectedYet should have correct message', () => {
    const error = new NoWalletConnectedYet();
    expect(error.message).toBe('No wallet connected yet');
  });

  test('NoGasPriceFound should have correct message', () => {
    const error = new NoGasPriceFound();
    expect(error.message).toBe('Gas price must be set in the client options when auto gas is used.');
  });

  test('NoActiveWallet should have correct message', () => {
    const error = new NoActiveWallet();
    expect(error.message).toBe('No active wallet');
  });

  test('NoValidRpcEndpointFound should have correct message', () => {
    const error = new NoValidRpcEndpointFound();
    expect(error.message).toBe('No valid rpc endpoint found');
  });
});