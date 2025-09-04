import { Chain } from '@chain-registry/types';
import { AminoSignResponse, BroadcastMode, CosmosWallet, DirectSignDoc, DirectSignResponse, OfflineAminoSigner, OfflineDirectSigner, SignOptions, StdSignature, Wallet, WalletAccount } from '@interchain-kit/core';
import { StdSignDoc } from '@interchainjs/types';
import Cosmos from '@ledgerhq/hw-app-cosmos';
import Transport from '@ledgerhq/hw-transport';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import CosmosApp from '@zondax/ledger-cosmos-js';
import { Buffer } from 'buffer';
import { chains } from 'chain-registry';

import { convertDerToFixed64, sortedObject } from './utils';

export class LedgerCosmosWallet extends CosmosWallet {

  getProvider(): Promise<unknown> {
    throw new Error('Method not implemented.');
  }

  cosmosPath: string;
  transport: Transport;
  cosmos: Cosmos;
  cosmosApp: CosmosApp;
  chainIdToBech32Prefix: Record<string, string> = {};
  hidSupported: boolean = false;
  errorMessage?: string;

  constructor(info?: Wallet) {
    super(info);
  }

  async init(meta?: unknown): Promise<void> {

    this.cosmosPath = `m/44'/118'/0'/0/0`;

    chains.forEach((c: Chain) => {
      this.chainIdToBech32Prefix[c.chainId] = c.bech32Prefix;
    });

    try {
      this.hidSupported = await TransportWebHID.isSupported();

    } catch (error) {
      this.hidSupported = false;
    }
  }

  async connect(chainId: string): Promise<void> {
    try {
      this.transport = await TransportWebHID.create();
      this.cosmosApp = new CosmosApp(this.transport);
      // try to get address to check app in ledger ready or not
      await this.cosmosApp.getAddressAndPubKey(`m/44'/118'/0'/0/0`, 'cosmoshub');
    } catch (error) {
      if ((error as any).message === 'CLA Not Supported') {
        throw new Error('Please choose Cosmos App in Ledger!!');
      }
      throw error;
    }
  }

  async disconnect(chainId: string): Promise<void> {
    if (this.transport) {
      await this.transport.close();
    }
  }

  async getAccount(chainId: string): Promise<WalletAccount> {
    const prefix = this.chainIdToBech32Prefix[chainId];
    if (!prefix) {
      throw new Error(`Unknown chainId: ${chainId}`);
    }
    if (!this.transport) {
      throw new Error('Ledger transport not initialized');
    }

    try {
      const { bech32_address, compressed_pk } = await this.cosmosApp.getAddressAndPubKey(this.cosmosPath, prefix);
      return {
        username: this.cosmosPath || '',
        address: bech32_address,
        algo: 'secp256k1',
        pubkey: compressed_pk,
        isNanoLedger: true,
      };
    } catch (error) {
      if ((error as any).message.includes('Unknown transport error')) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const account = this.getAccount(chainId);
            resolve(account);
          }, 500);
        });
      }
      this.errorMessage = (error as any).message;
    }
  }

  getAccounts(chainIds: string[]): Promise<WalletAccount[]> {
    throw new Error('Method not implemented.');
  }

  async getOfflineSigner(chainId: unknown, preferredSignType?: unknown) {
    return this.getOfflineSignerAmino(chainId as string);
  }

  getOfflineSignerAmino(chainId: string): OfflineAminoSigner {
    return {
      getAccounts: async () => [await this.getAccount(chainId)],
      signAmino: async (signer, signDoc) => this.signAmino(chainId, signer, signDoc, {}),
    };
  }

  getOfflineSignerDirect(chainId: string): OfflineDirectSigner {
    throw new Error('Method not implemented.');
  }

  async signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<AminoSignResponse> {

    const signDataBuffer = Buffer.from(JSON.stringify(sortedObject(signDoc)), 'utf-8');

    const cosmosPath = `m/44'/118'/0'/0/0`;
    const hrp = this.chainIdToBech32Prefix[chainId];
    const response = await this.cosmosApp.sign(cosmosPath, signDataBuffer, hrp);
    const { compressed_pk } = await this.cosmosApp.getAddressAndPubKey(cosmosPath, hrp);

    return {
      signed: signDoc,
      signature: {
        pub_key: {
          type: 'tendermint/PubKeySecp256k1',
          value: compressed_pk.toString('base64'),
        },
        signature: Buffer.from(convertDerToFixed64(response.signature)).toString('base64'),
      }
    };
  }

  signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature> {
    throw new Error('Method not implemented.');
  }

  verifyArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  signDirect(chainId: string, signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions): Promise<DirectSignResponse> {
    throw new Error('Method not implemented.');
  }

  sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }

  addSuggestChain(chainId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  bindingEvent(): void {
    throw new Error('Method not implemented.');
  }

  unbindingEvent(): void {
    throw new Error('Method not implemented.');
  }

}