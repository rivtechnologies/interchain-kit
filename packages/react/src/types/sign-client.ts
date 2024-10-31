import { WalletManager } from "@interchain-kit/core";

export type SigningClient = Awaited<ReturnType<WalletManager['getSigningClient']>>