const promiseCache = new Map<string, Promise<any>>();

export function deduplicatePromise<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (promiseCache.has(key)) {
    return promiseCache.get(key) as Promise<T>;
  }

  const promise = fn().finally(() => {
    promiseCache.delete(key);
  });

  promiseCache.set(key, promise);
  return promise;
}