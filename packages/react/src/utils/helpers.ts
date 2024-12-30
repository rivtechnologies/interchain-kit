export function bindAllMethodsToContext<T extends object>(context: T): T {
  return new Proxy(context, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === 'function') {
        return value.bind(context);
      }
      return value;
    }
  });
}