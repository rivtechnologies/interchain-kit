import { AOPProxy, createAOPProxy, applyAdvice, MethodAdvice } from '../src/utils/aop';

// Test classes for AOP testing
class TestClass {
  public value: string = 'test';
  public counter: number = 0;

  syncMethod(arg: string): string {
    this.counter++;
    return `sync: ${arg}`;
  }

  async asyncMethod(arg: string): Promise<string> {
    this.counter++;
    return `async: ${arg}`;
  }

  errorMethod(): never {
    throw new Error('Test error');
  }

  async asyncErrorMethod(): Promise<never> {
    throw new Error('Async test error');
  }

  getValue(): string {
    return this.value;
  }

  setValue(newValue: string): void {
    this.value = newValue;
  }
}

class ExtendedTestClass extends TestClass {
  extendedMethod(): string {
    return 'extended';
  }
}

describe('AOPProxy', () => {
  let testInstance: TestClass;
  let extendedInstance: ExtendedTestClass;

  beforeEach(() => {
    testInstance = new TestClass();
    extendedInstance = new ExtendedTestClass();
  });

  describe('Basic Functionality', () => {
    it('should create a proxy that preserves original functionality', () => {
      const proxy = new AOPProxy({
        target: testInstance,
        advice: {},
      }).createProxy();

      expect(proxy.syncMethod('test')).toBe('sync: test');
      expect(proxy.getValue()).toBe('test');
      expect(proxy.value).toBe('test');
    });

    it('should preserve non-function properties', () => {
      const proxy = new AOPProxy({
        target: testInstance,
        advice: {},
      }).createProxy();

      expect(proxy.value).toBe('test');
      expect(proxy.counter).toBe(0);
    });

    it('should handle extended classes', () => {
      const proxy = new AOPProxy({
        target: extendedInstance,
        advice: {},
      }).createProxy();

      expect(proxy.syncMethod('test')).toBe('sync: test');
      expect(proxy.extendedMethod()).toBe('extended');
      expect(proxy.value).toBe('test');
    });
  });

  describe('Before Advice', () => {
    it('should execute before advice for sync methods', () => {
      const beforeSpy = jest.fn();

      const proxy = new AOPProxy({
        target: testInstance,
        advice: {
          syncMethod: {
            before: beforeSpy,
          },
        },
      }).createProxy();

      const result = proxy.syncMethod('test');

      expect(beforeSpy).toHaveBeenCalledWith('syncMethod', proxy, 'test');
      expect(result).toBe('sync: test');
    });

    it('should execute before advice for async methods', async () => {
      const beforeSpy = jest.fn();

      const proxy = new AOPProxy({
        target: testInstance,
        advice: {
          asyncMethod: {
            before: beforeSpy,
          },
        },
      }).createProxy();

      const result = await proxy.asyncMethod('test');

      expect(beforeSpy).toHaveBeenCalledWith('asyncMethod', proxy, 'test');
      expect(result).toBe('async: test');
    });

    it('should execute before advice for extended class methods', () => {
      const beforeSpy = jest.fn();

      const proxy = new AOPProxy({
        target: extendedInstance,
        advice: {
          extendedMethod: {
            before: beforeSpy,
          },
        },
      }).createProxy();

      const result = proxy.extendedMethod();

      expect(beforeSpy).toHaveBeenCalledWith('extendedMethod', proxy);
      expect(result).toBe('extended');
    });
  });

  describe('After Advice', () => {
    it('should execute after advice for sync methods', () => {
      const afterSpy = jest.fn();

      const proxy = new AOPProxy({
        target: testInstance,
        advice: {
          syncMethod: {
            after: afterSpy,
          },
        },
      }).createProxy();

      const result = proxy.syncMethod('test');

      expect(afterSpy).toHaveBeenCalledWith('syncMethod', proxy, 'sync: test', 'test');
      expect(result).toBe('sync: test');
    });

    it('should execute after advice for async methods', async () => {
      const afterSpy = jest.fn();

      const proxy = new AOPProxy({
        target: testInstance,
        advice: {
          asyncMethod: {
            after: afterSpy,
          },
        },
      }).createProxy();

      const result = await proxy.asyncMethod('test');

      expect(afterSpy).toHaveBeenCalledWith('asyncMethod', proxy, 'async: test', 'test');
      expect(result).toBe('async: test');
    });
  });

  describe('AfterReturn Advice', () => {
    it('should execute afterReturn advice for sync methods', () => {
      const afterReturnSpy = jest.fn();

      const proxy = new AOPProxy({
        target: testInstance,
        advice: {
          syncMethod: {
            afterReturn: afterReturnSpy,
          },
        },
      }).createProxy();

      const result = proxy.syncMethod('test');

      expect(afterReturnSpy).toHaveBeenCalledWith('syncMethod', proxy, 'sync: test', 'test');
      expect(result).toBe('sync: test');
    });

    it('should execute afterReturn advice for async methods', async () => {
      const afterReturnSpy = jest.fn();

      const proxy = new AOPProxy({
        target: testInstance,
        advice: {
          asyncMethod: {
            afterReturn: afterReturnSpy,
          },
        },
      }).createProxy();

      const result = await proxy.asyncMethod('test');

      expect(afterReturnSpy).toHaveBeenCalledWith('asyncMethod', proxy, 'async: test', 'test');
      expect(result).toBe('async: test');
    });
  });

  describe('Around Advice', () => {
    it('should execute around advice for sync methods', () => {
      const aroundSpy = jest.fn().mockImplementation((methodName, target, originalMethod, ...args) => {
        return `wrapped: ${originalMethod(...args)}`;
      });

      const proxy = new AOPProxy({
        target: testInstance,
        advice: {
          syncMethod: {
            around: aroundSpy,
          },
        },
      }).createProxy();

      const result = proxy.syncMethod('test');

      expect(aroundSpy).toHaveBeenCalledWith('syncMethod', proxy, expect.any(Function), 'test');
      expect(result).toBe('wrapped: sync: test');
    });

    it('should execute around advice for async methods', async () => {
      const aroundSpy = jest.fn().mockImplementation(async (methodName, target, originalMethod, ...args) => {
        const result = await originalMethod(...args);
        return `wrapped: ${result}`;
      });

      const proxy = new AOPProxy({
        target: testInstance,
        advice: {
          asyncMethod: {
            around: aroundSpy,
          },
        },
      }).createProxy();

      const result = await proxy.asyncMethod('test');

      expect(aroundSpy).toHaveBeenCalledWith('asyncMethod', proxy, expect.any(Function), 'test');
      expect(result).toBe('wrapped: async: test');
    });
  });

  describe('Error Handling', () => {
    it('should execute onError advice for sync methods', () => {
      const errorSpy = jest.fn();

      const proxy = new AOPProxy({
        target: testInstance,
        advice: {
          errorMethod: {
            onError: errorSpy,
          },
        },
      }).createProxy();

      expect(() => proxy.errorMethod()).toThrow('Test error');
      expect(errorSpy).toHaveBeenCalledWith('errorMethod', proxy, expect.any(Error));
    });

    it('should execute onError advice for async methods', async () => {
      const errorSpy = jest.fn();

      const proxy = new AOPProxy({
        target: testInstance,
        advice: {
          asyncErrorMethod: {
            onError: errorSpy,
          },
        },
      }).createProxy();

      await expect(proxy.asyncErrorMethod()).rejects.toThrow('Async test error');
      expect(errorSpy).toHaveBeenCalledWith('asyncErrorMethod', proxy, expect.any(Error));
    });

    it('should not execute after/afterReturn advice when error occurs', () => {
      const afterSpy = jest.fn();
      const afterReturnSpy = jest.fn();
      const errorSpy = jest.fn();

      const proxy = new AOPProxy({
        target: testInstance,
        advice: {
          errorMethod: {
            after: afterSpy,
            afterReturn: afterReturnSpy,
            onError: errorSpy,
          },
        },
      }).createProxy();

      expect(() => proxy.errorMethod()).toThrow('Test error');
      expect(afterSpy).not.toHaveBeenCalled();
      expect(afterReturnSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('Default Advice', () => {
    it('should apply default advice to methods without specific advice', () => {
      const defaultBeforeSpy = jest.fn();
      const specificBeforeSpy = jest.fn();

      const proxy = new AOPProxy({
        target: testInstance,
        advice: {
          syncMethod: {
            before: specificBeforeSpy,
          },
        },
        defaultAdvice: {
          before: defaultBeforeSpy,
        },
      }).createProxy();

      proxy.syncMethod('test');
      proxy.getValue();

      expect(specificBeforeSpy).toHaveBeenCalledWith('syncMethod', proxy, 'test');
      expect(defaultBeforeSpy).toHaveBeenCalledWith('getValue', proxy);
    });
  });

  describe('Multiple Advice Types', () => {
    it('should execute multiple advice types in correct order', () => {
      const beforeSpy = jest.fn();
      const afterSpy = jest.fn();
      const afterReturnSpy = jest.fn();

      const proxy = new AOPProxy({
        target: testInstance,
        advice: {
          syncMethod: {
            before: beforeSpy,
            after: afterSpy,
            afterReturn: afterReturnSpy,
          },
        },
      }).createProxy();

      const result = proxy.syncMethod('test');

      expect(beforeSpy).toHaveBeenCalled();
      expect(afterSpy).toHaveBeenCalled();
      expect(afterReturnSpy).toHaveBeenCalled();
      expect(result).toBe('sync: test');
    });
  });

  describe('Context Preservation', () => {
    it('should preserve this context in original methods', () => {
      const proxy = new AOPProxy({
        target: testInstance,
        advice: {
          syncMethod: {
            before: (methodName, target) => {
              target.setValue('modified');
            },
          },
        },
      }).createProxy();

      proxy.syncMethod('test');
      expect(testInstance.value).toBe('modified');
    });

    it('should preserve this context in around advice', () => {
      const proxy = new AOPProxy({
        target: testInstance,
        advice: {
          syncMethod: {
            around: (methodName, target, originalMethod, ...args) => {
              target.setValue('around-modified');
              return originalMethod(...args);
            },
          },
        },
      }).createProxy();

      proxy.syncMethod('test');
      expect(testInstance.value).toBe('around-modified');
    });
  });
});

describe('createAOPProxy', () => {
  it('should create AOP proxy using utility function', () => {
    const testInstance = new TestClass();
    const beforeSpy = jest.fn();

    const proxy = createAOPProxy({
      target: testInstance,
      advice: {
        syncMethod: {
          before: beforeSpy,
        },
      },
    });

    const result = proxy.syncMethod('test');

    expect(beforeSpy).toHaveBeenCalledWith('syncMethod', proxy, 'test');
    expect(result).toBe('sync: test');
  });
});

describe('applyAdvice', () => {
  it('should apply advice to existing object', () => {
    const testInstance = new TestClass();
    const beforeSpy = jest.fn();

    const proxy = applyAdvice(testInstance, {
      syncMethod: {
        before: beforeSpy,
      },
    });

    const result = proxy.syncMethod('test');

    expect(beforeSpy).toHaveBeenCalledWith('syncMethod', proxy, 'test');
    expect(result).toBe('sync: test');
  });

  it('should apply advice with default advice', () => {
    const testInstance = new TestClass();
    const defaultBeforeSpy = jest.fn();

    const proxy = applyAdvice(
      testInstance,
      {},
      {
        before: defaultBeforeSpy,
      }
    );

    proxy.syncMethod('test');
    proxy.getValue();

    expect(defaultBeforeSpy).toHaveBeenCalledTimes(2);
  });
});
