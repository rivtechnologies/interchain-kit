// export const createObservable = (object: any, onUpdate?: () => void): any => {
//   if (object === null || typeof object !== 'object' || object instanceof Promise) {
//     return object;
//   }
//   return new Proxy(object, {
//     set(target, property, newValue, receiver) {
//       onUpdate && onUpdate();
//       return Reflect.set(target, property, createObservable(newValue, onUpdate), receiver);
//     },
//     get(target, property, receiver) {
//       const value = Reflect.get(target, property, receiver);
//       return createObservable(value, onUpdate);
//     }
//   });
// };

type ChangeDetails = {
  target: any; // 由于我们处理的是动态对象，所以这里使用any
  prop: string | symbol;
  oldValue: any;
  newValue: any;
};

type ChangeCallback = (change: ChangeDetails) => void;

export function createObservable<T extends object>(target: T, updateCallback: ChangeCallback): T {
  const proxiedObjects = new WeakMap<object, any>();

  function createProxy(obj: object): any {
    if (typeof obj !== 'object' || obj === null || obj instanceof Promise) return obj;
    if (proxiedObjects.has(obj)) return proxiedObjects.get(obj);

    const proxy = new Proxy(obj, {
      get(target: object, prop: string | symbol, receiver: any): any {
        const value = Reflect.get(target, prop, receiver);
        return typeof value === 'object' && value !== null ? createProxy(value) : value;
      },
      set(target: object, prop: string | symbol, value: any, receiver: any): boolean {
        const oldValue = Reflect.get(target, prop, receiver);
        if (oldValue !== value) {
          // 調用更新回調函數
          updateCallback({ target, prop, oldValue, newValue: value });
          if (typeof value === 'object' && value !== null) {
            value = createProxy(value);
          }
          return Reflect.set(target, prop, value, receiver);
        }
        return true;
      }
    });

    proxiedObjects.set(obj, proxy);
    return proxy;
  }

  return createProxy(target) as T;
}