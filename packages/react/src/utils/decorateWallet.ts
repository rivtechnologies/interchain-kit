import { BaseWallet } from "@interchain-kit/core";

export const decorateWallet = <T extends BaseWallet>(wallet: T, decorateMethods: Partial<T>): T => {
  return new Proxy(wallet, {
    get(target, prop, receiver) {
      if (prop in decorateMethods) {
        const method = decorateMethods[prop as keyof T];
        if (typeof method === "function") {
          return method.bind(target);
        }
        return method;
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}