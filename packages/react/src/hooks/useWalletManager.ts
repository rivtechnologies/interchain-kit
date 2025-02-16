
import { useStore } from "zustand";
import { useInterchainWalletContext } from "../provider"

function bindMethodsToContext(context: any) {
  for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(context))) {
    const value = context[key];
    if (typeof value === 'function') {
      context[key] = value.bind(context);
    }
  }
}

export const useWalletManager = () => {
  const object = useInterchainWalletContext();
  // put useStore here to update the hook
  const store = useStore(object.store)
  bindMethodsToContext(object);
  return object;
}