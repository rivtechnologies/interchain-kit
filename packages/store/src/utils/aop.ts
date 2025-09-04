/**
 * AOP (Aspect-Oriented Programming) implementation similar to Java AOP
 * Using Object.create, Object.getOwnPropertyNames, and Object.getPrototypeOf
 */

// 基础类型定义
export type MethodName<T> = keyof T & string;
export type MethodArgs<T, K extends MethodName<T>> = T[K] extends (...args: infer A) => any ? A : never;
export type MethodReturn<T, K extends MethodName<T>> = T[K] extends (...args: any[]) => infer R ? R : never;

// 方法 advice 接口 - 使用展开参数，保持参数类型不变
export interface MethodAdvice<T, K extends MethodName<T>> {
  before?: (methodName: K, target: T, ...args: MethodArgs<T, K>) => void;
  after?: (methodName: K, target: T, result: MethodReturn<T, K>, ...args: MethodArgs<T, K>) => void;
  afterReturn?: (methodName: K, target: T, result: MethodReturn<T, K>, ...args: MethodArgs<T, K>) => void;
  around?: (methodName: K, target: T, originalMethod: T[K], ...args: MethodArgs<T, K>) => MethodReturn<T, K>;
  onError?: (methodName: K, target: T, error: Error, ...args: MethodArgs<T, K>) => void;
}

// AOP 配置接口
export interface AOPConfig<T = any> {
  target: T;
  advice: {
    [K in MethodName<T>]?: MethodAdvice<T, K>;
  };
  defaultAdvice?: MethodAdvice<T, MethodName<T>>;
}

// 代理对象类型
export type AOPProxyType<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
  ? T[K]
  : T[K];
};

export class AOPProxy<T = any> {
  private target: T;
  private advice: { [K in MethodName<T>]?: MethodAdvice<T, K> };
  private defaultAdvice?: MethodAdvice<T, MethodName<T>>;

  constructor(config: AOPConfig<T>) {
    this.target = config.target;
    this.advice = config.advice;
    this.defaultAdvice = config.defaultAdvice;
  }

  /**
   * Get advice for a specific method
   */
  private getMethodAdvice(methodName: string): MethodAdvice<T, any> | undefined {
    return (this.advice as any)[methodName] || this.defaultAdvice;
  }

  /**
   * Collect all property names from the instance and its prototype chain
   * (excluding Object.prototype). This allows intercepting prototype methods
   * in addition to own instance methods.
   */
  private getAllMemberNames(): MethodName<T>[] {
    const names = new Set<string>();

    // Own properties (instance fields and own methods)
    Object.getOwnPropertyNames(this.target).forEach((name) => {
      names.add(name);
    });

    // Prototype chain methods
    let proto = Object.getPrototypeOf(this.target);
    while (proto && proto !== Object.prototype) {
      Object.getOwnPropertyNames(proto).forEach((name) => {
        if (name !== 'constructor') {
          names.add(name);
        }
      });
      proto = Object.getPrototypeOf(proto);
    }

    return Array.from(names) as MethodName<T>[];
  }



  /**
   * Create a proxy object with AOP capabilities
   */
  createProxy(): AOPProxyType<T> {
    const proxy = Object.create(Object.getPrototypeOf(this.target));

    // Gather members from the instance and its prototype chain
    const memberNames = this.getAllMemberNames();

    memberNames.forEach((name) => {
      const value = (this.target as any)[name];
      const isFunction = typeof value === 'function';

      if (isFunction) {
        const methodAdvice = this.getMethodAdvice(name);
        if (methodAdvice) {
          // 只拦截有 advice 的方法，其他方法保持原型链结构
          this.interceptMethod(proxy, name as MethodName<T>, methodAdvice as MethodAdvice<T, any>);
        } else {
          // 对于没有 advice 的方法，创建一个委托到原始实例的包装器
          Object.defineProperty(proxy, name, {
            value: (...args: any[]) => {
              return value.apply(this.target, args);
            },
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      } else {
        // 对于非函数属性，创建 getter/setter 来委托到原始实例
        Object.defineProperty(proxy, name, {
          get: () => (this.target as any)[name],
          set: (newValue: any) => {
            (this.target as any)[name] = newValue;
          },
          enumerable: true,
          configurable: true
        });
      }
    });

    return proxy as AOPProxyType<T>;
  }

  /**
   * Intercept a specific method with AOP advice
   */
  private interceptMethod<K extends MethodName<T>>(
    proxy: any,
    methodName: K,
    methodAdvice: MethodAdvice<T, K>
  ): void {
    const originalMethod = this.target[methodName] as (...args: any[]) => any;

    Object.defineProperty(proxy, methodName, {
      value: (...args: any[]) => {
        try {
          // Before advice - 传递 proxy 作为 target 参数
          if (methodAdvice.before) {
            methodAdvice.before(methodName, proxy, ...(args as MethodArgs<T, K>));
          }

          let result: any;

          // Around advice - 传递绑定了原始目标上下文的原始方法
          if (methodAdvice.around) {
            // 创建一个包装函数，确保 originalMethod 使用 target 作为 this 上下文
            // 使用 bind 来确保 this 上下文正确绑定
            const wrappedOriginalMethod = originalMethod.bind(this.target);
            result = methodAdvice.around(methodName, proxy, wrappedOriginalMethod as T[K], ...(args as MethodArgs<T, K>));
            return result;
          } else {
            // Execute original method with target as this context to ensure state consistency
            result = originalMethod.apply(this.target, args);
          }

          // 检查结果是否是 Promise
          if (result && typeof result.then === 'function') {
            // 异步方法 - 使用 Promise 链处理
            return result
              .then((resolvedResult: any) => {
                // After advice - 传递 proxy 作为 target 参数
                if (methodAdvice.after) {
                  methodAdvice.after(methodName, proxy, resolvedResult, ...(args as MethodArgs<T, K>));
                }

                // AfterReturn advice - 在方法返回之前执行
                if (methodAdvice.afterReturn) {
                  methodAdvice.afterReturn(methodName, proxy, resolvedResult, ...(args as MethodArgs<T, K>));
                }

                return resolvedResult;
              })
              .catch((error: any) => {
                // Error advice - 传递 proxy 作为 target 参数
                if (methodAdvice.onError) {
                  methodAdvice.onError(methodName, proxy, error as Error, ...(args as MethodArgs<T, K>));
                }
                throw error;
              });
          } else {
            // 同步方法
            // After advice - 传递 proxy 作为 target 参数
            if (methodAdvice.after) {
              methodAdvice.after(methodName, proxy, result, ...(args as MethodArgs<T, K>));
            }

            // AfterReturn advice - 在方法返回之前执行
            if (methodAdvice.afterReturn) {
              methodAdvice.afterReturn(methodName, proxy, result, ...(args as MethodArgs<T, K>));
            }

            return result;
          }
        } catch (error) {
          // Error advice - 传递 proxy 作为 target 参数
          if (methodAdvice.onError) {
            methodAdvice.onError(methodName, proxy, error as Error, ...(args as MethodArgs<T, K>));
          }
          throw error;
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    });
  }
}

/**
 * Utility function to create AOP proxy with type safety
 */
export function createAOPProxy<T>(config: AOPConfig<T>): AOPProxyType<T> {
  const aopProxy = new AOPProxy<T>(config);
  return aopProxy.createProxy();
}

/**
 * Utility function to apply advice to an existing object
 */
export function applyAdvice<T>(
  target: T,
  advice: { [K in MethodName<T>]?: MethodAdvice<T, K> },
  defaultAdvice?: MethodAdvice<T, MethodName<T>>
): AOPProxyType<T> {
  return createAOPProxy({ target, advice, defaultAdvice });
}
