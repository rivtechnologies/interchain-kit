import { BaseWallet } from "./base-wallet";
import { Wallet, WalletAccount, SignType } from "../types";
import { IGenericOfflineSigner } from "@interchainjs/types";
import { Chain } from "@chain-registry/types";
import { getClientFromExtension } from "../utils";

function publicKeyToUint8Array(publicKey: any): Uint8Array {
    if (publicKey?.toBytes) return publicKey.toBytes();
    if (publicKey?.toBuffer) return new Uint8Array(publicKey.toBuffer());
    if (publicKey instanceof Uint8Array) return publicKey;
    if (typeof publicKey === "string") {
        // 简单处理，实际建议用 base58 解码
        return new TextEncoder().encode(publicKey);
    }
    return new Uint8Array();
}

export class SolanaWallet extends BaseWallet {
    solana: any;

    constructor(info: Wallet) {
        super(info);
    }

    async init(): Promise<void> {
        this.solana = await getClientFromExtension(this.info.solanaKey)
    }

    async connect(chainId: Chain["chainId"]): Promise<void> {
        if (!this.solana) throw new Error("Solana wallet not found");
        try {
            await this.solana.connect();
        } catch (error) {
            console.log(error)
        }

    }

    async disconnect(chainId: Chain["chainId"]): Promise<void> {
        if (!this.solana) throw new Error("Solana wallet not found");
        await this.solana.disconnect();
    }

    async getAccount(chainId: Chain["chainId"]): Promise<WalletAccount> {
        if (!this.solana || !this.solana.publicKey) throw new Error("Not connected");
        return {
            address: this.solana.publicKey.toString(),
            pubkey: publicKeyToUint8Array(this.solana.publicKey),
            // 只能用'secp256k1'或'eth_secp256k1'，实际Solana是ed25519，但类型限制只能兼容
            algo: "secp256k1",
            username: "solana",
            isNanoLedger: false,
            isSmartContract: false,
        };
    }

    async getOfflineSigner(chainId: Chain["chainId"], preferredSignType?: SignType): Promise<IGenericOfflineSigner> {
        return {
            getAccounts: async () => [await this.getAccount(chainId)],
            sign: async (args: any) => {
                if (!this.solana) throw new Error("Solana wallet not found");
                const { message } = args;
                const { signature } = await this.solana.signMessage(message, "utf8");
                return signature;
            },
            signMode: "direct"
        } as IGenericOfflineSigner;
    }

    async addSuggestChain(chainId: Chain["chainId"]): Promise<void> {
        throw new Error("Solana does not support suggest chain");
    }

    async getProvider(chainId: Chain["chainId"]): Promise<any> {
        return this.solana;
    }


    //solana provider methods
    async request(method: string, params: any): Promise<any> {
        if (!this.solana) throw new Error("Solana wallet not found");
        return this.solana.request({
            method,
            params
        });
    }

    async signAllTransactions(transactions: any[]): Promise<any> {
        if (!this.solana) throw new Error("Solana wallet not found");
        return this.solana.signAllTransactions(transactions);
    }

    async signAndSendAllTransactions(transactions: any[]): Promise<any> {
        if (!this.solana) throw new Error("Solana wallet not found");
        return this.solana.signAndSendAllTransactions(transactions);
    }

    async signAndSendTransactions(transactions: any[]): Promise<any> {
        if (!this.solana) throw new Error("Solana wallet not found");
        return this.solana.signAndSendTransactions(transactions);
    }

    async signAndSendTransaction(transaction: any): Promise<any> {
        if (!this.solana) throw new Error("Solana wallet not found");
        return this.solana.signAndSendTransaction(transaction);
    }

    async signIn(data: any): Promise<void> {
        if (!this.solana) throw new Error("Solana wallet not found");
        return this.solana.signIn(data);
    }

    async signMessage(message: string): Promise<any> {
        if (!this.solana) throw new Error("Solana wallet not found");
        return this.solana.signMessage(message);
    }

    async signTransaction(transaction: any): Promise<any> {
        if (!this.solana) throw new Error("Solana wallet not found");
        return this.solana.signTransaction(transaction);
    }
}
