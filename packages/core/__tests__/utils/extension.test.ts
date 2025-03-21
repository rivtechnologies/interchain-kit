/**
 * @jest-environment jsdom
 */

import { travelObject, getClientFromExtension } from '../../src/utils/extension';
import { clientNotExistError } from '../../src/utils/errors';

describe('travelObject', () => {
  it('should return the correct nested object', () => {
    const obj: Record<string, any> = { a: { b: { c: 42 } } };
    const paths: string[] = ['a', 'b', 'c'];
    expect(travelObject(obj, paths)).toBe(42);
  });

  it('should return undefined for non-existing path', () => {
    const obj: Record<string, any> = { a: { b: { c: 42 } } };
    const paths: string[] = ['a', 'b', 'd'];
    expect(travelObject(obj, paths)).toBeUndefined();
  });

  it('should return undefined if an error occurs', () => {
    const obj: any = null;
    const paths: string[] = ['a', 'b', 'c'];
    expect(travelObject(obj, paths)).toBeUndefined();
  });
});

describe('getClientFromExtension', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'window', {
      value: {
        myWallet: { key: 'value' },
      },
      writable: true,
    });
  });

  it('should return undefined if window is undefined', async () => {

    const windoww = global.window;

    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true,
    })

    expect(await getClientFromExtension('myWallet')).toBeUndefined();

    Object.defineProperty(global, 'window', {
      value: windoww,
      writable: true,
    })

  });

  it('should return the wallet if it exists', async () => {
    expect(await getClientFromExtension('myWallet')).toEqual({ key: 'value' });
  });

  it('should throw clientNotExistError if wallet does not exist and document is complete', async () => {
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true,
    });
    await expect(getClientFromExtension('nonExistentWallet')).rejects.toThrow(clientNotExistError);
  });

  it('should resolve the wallet when document state changes to complete', async () => {
    Object.defineProperty(document, 'readyState', {
      value: 'loading',
      writable: true,
    });

    const promise: Promise<any> = getClientFromExtension('myWallet');
    document.dispatchEvent(new Event('readystatechange'));
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true,
    });
    document.dispatchEvent(new Event('readystatechange'));

    await expect(promise).resolves.toEqual({ key: 'value' });
  });

  it('should reject with clientNotExistError when document state changes to complete and wallet does not exist', async () => {
    Object.defineProperty(document, 'readyState', {
      value: 'loading',
      writable: true,
    });

    const promise: Promise<any> = getClientFromExtension('nonExistentWallet');
    document.dispatchEvent(new Event('readystatechange'));
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true,
    });
    document.dispatchEvent(new Event('readystatechange'));

    await expect(promise).rejects.toBe(clientNotExistError.message);
  });
});
