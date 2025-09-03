import { InterchainStoreType } from "../types";

const INTERCHAIN_KIT_STORAGE_KEY = 'interchain-kit-store';

export class LocalStorage {
  save(value: Partial<InterchainStoreType>) {
    localStorage.setItem(INTERCHAIN_KIT_STORAGE_KEY, JSON.stringify(value));
  }
  load(): Partial<InterchainStoreType> {
    return JSON.parse(localStorage.getItem(INTERCHAIN_KIT_STORAGE_KEY) || '{}');
  }
}