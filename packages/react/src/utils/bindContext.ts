/**
 * 绑定上下文工具函数的类型定义
 */

/**
 * 可绑定方法的对象类型
 */
export interface BindableObject {
  [key: string]: any;
}

/**
 * 绑定后的对象类型，保持原始对象的类型结构
 */
export type BoundObject<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
  ? (...args: A) => R
  : T[K];
};




/**
 * 绑定对象的所有方法，确保 getter 属性能正确访问原始对象的上下文
 * @param obj 要绑定方法的对象
 * @returns 绑定后的对象副本
 */
export function bindAllMethods<T extends BindableObject>(obj: T): BoundObject<T> {
  if (!obj) return obj as BoundObject<T>;

  const boundObj = { ...obj } as BoundObject<T>;

  // 处理原型链上的方法和 getter
  Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).forEach((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(obj), key);
    if (descriptor) {
      if (typeof descriptor.value === 'function' && key !== 'constructor') {
        // 原型链上的方法
        (boundObj as any)[key] = descriptor.value.bind(obj);
      } else if (descriptor.get) {
        // 原型链上的 getter 属性 - 绑定 this 上下文到原始对象
        Object.defineProperty(boundObj, key, {
          get: function (): any {
            return descriptor.get!.call(obj);
          },
          enumerable: descriptor.enumerable,
          configurable: descriptor.configurable
        });
      }
    }
  });

  // 处理实例上的方法，包括 getter 属性
  Object.getOwnPropertyNames(obj).forEach((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(obj, key);
    if (descriptor) {
      if (typeof descriptor.value === 'function') {
        // 普通方法
        (boundObj as any)[key] = descriptor.value.bind(obj);
      } else if (descriptor.get) {
        // getter 属性 - 绑定 this 上下文到原始对象
        Object.defineProperty(boundObj, key, {
          get: function (): any {
            return descriptor.get!.call(obj);
          },
          enumerable: descriptor.enumerable,
          configurable: descriptor.configurable
        });
      }
    }
  });

  return boundObj;
}
