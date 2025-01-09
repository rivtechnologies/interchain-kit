const INTERCHAIN_CURRENT_WALLET_STORE_KEY = 'interchain_current_wallet';
const INTERCHAIN_CURRENT_CHAIN_STORE_KEY = 'interchain_current_chain';

export function getWalletNameFromLocalStorage(): string | undefined {
    return localStorage.getItem(INTERCHAIN_CURRENT_WALLET_STORE_KEY);
}

export function setWalletNameToLocalStorage(walletName: string): void {
    localStorage.setItem(INTERCHAIN_CURRENT_WALLET_STORE_KEY, walletName);
}

export function removeWalletNameFromLocalStorage(): void {
    localStorage.removeItem(INTERCHAIN_CURRENT_WALLET_STORE_KEY);
}

export function getChainNameFromLocalStorage(): string | undefined {
    return localStorage.getItem(INTERCHAIN_CURRENT_CHAIN_STORE_KEY);
}

export function setChainNameToLocalStorage(chainName: string): void {
    localStorage.setItem(INTERCHAIN_CURRENT_CHAIN_STORE_KEY, chainName);
}

export function removeChainNameFromLocalStorage(): void {
    localStorage.removeItem(INTERCHAIN_CURRENT_CHAIN_STORE_KEY);
}