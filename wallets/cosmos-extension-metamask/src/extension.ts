import { BroadcastMode, DirectSignDoc, ExtensionWallet, SignOptions, WalletAccount } from '@interchain-kit/core';

declare global {
  interface Window {
    ethereum: any;
  }
}

import { OfflineAminoSigner, OfflineDirectSigner, AminoSignResponse, StdSignature, DirectSignResponse } from '@interchainjs/cosmos/types/wallet';
import { StdSignDoc } from '@interchainjs/types';
import { Chain, AssetList } from '@chain-registry/v2-types'
import { getMetaMaskCosmosChainInfo } from './utils';
import { Chain as MetaMaskCosmosChainInfo } from './types'

export const DEFAULT_SNAP_ID = "npm:@cosmsnap/snap";

export const isSnapInstalled = async (snapId = DEFAULT_SNAP_ID) => {
  let result = await window.ethereum.request({ method: 'wallet_getSnaps' });
  const installed = Object.keys(result).includes(snapId);

  console.log('isSnapInstalled', installed)

  return installed
}

export const isSnapInitialized = async (snapId = DEFAULT_SNAP_ID): Promise<boolean> => {
  const initialized = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: snapId,
      request: {
        method: 'initialized',
      },
    },
  });
  // console.log(initialized.data.initialized)
  // if (initialized.data.initialized === false) {

  //   await new Promise((resolve) => setTimeout(resolve, 2000));
  //   return isSnapInitialized(snapId)

  // }

  console.log('isInitialize', initialized)

  return initialized.data.initialized
}

export const installSnap = async (snapId = DEFAULT_SNAP_ID) => {
  let installed = await isSnapInstalled();
  if (!installed) {
    await window.ethereum.request({
      method: 'wallet_requestSnaps',
      params: {
        [snapId]: {
          version: '^0.1.0',
        },
      },
    });
  }
  let initialized = await isSnapInitialized();
  if (!initialized) {
    await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId,
        request: {
          method: 'initialize',
        },
      },
    });
  };
}


export class CosmosExtensionMetaMask extends ExtensionWallet {

  chains: MetaMaskCosmosChainInfo[] = []

  async getChains(): Promise<MetaMaskCosmosChainInfo[]> {
    const result = await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: 'npm:@cosmsnap/snap',
        request: {
          method: 'getChains'
        },
      },
    });
    return result.data.chains
  }

  async init(meta?: unknown) {
    try {
      if (!window.ethereum || window.ethereum.isMetaMask !== true) {
        throw new Error('MetaMask is not installed');
      }
      await installSnap();
      this.chains = await this.getChains()
      this.isExtensionInstalled = true;
    } catch (error) {
      this.errorMessage = (error as any).message;
      this.isExtensionInstalled = true;
    }
  }

  async connect(chainId: string | string[]): Promise<void> {
    await window.ethereum.request({
      method: 'wallet_requestSnaps',
      params: {
        [DEFAULT_SNAP_ID]: {},
      },
    });
    this.chains = await this.getChains()
    const chain = this.chains.find(c => c.chain_id === chainId);

    if (!chain) {
      throw new Error(`There is no chain info for ${chainId}`);
    }
  }

  async disconnect(chainId: string | string[]): Promise<void> {
    await window.ethereum.request({
      method: 'wallet_revokePermissions',
      params: [
        {
          eth_accounts: {},
        },
      ],
    });
  }

  async getAccount(chainId: string): Promise<WalletAccount> {
    const result = await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: DEFAULT_SNAP_ID,
        request: {
          method: 'getAccountInfo',
          params: {
            chain_id: chainId,
          }
        },
      },
    });

    const { address, pubkey, algo } = result.data;

    return {
      address,
      algo,
      pubkey: new Uint8Array(Object.values(pubkey)),
      isNanoLedger: false,
      isSmartContract: false,
      username: 'cosmos in metamask',
    }
  }

  getAccounts(chainIds: string[]): Promise<WalletAccount[]> {
    throw new Error('Method not implemented.');
  }

  getOfflineSignerAmino(chainId: string): OfflineAminoSigner {
    return {
      getAccounts: async () => [await this.getAccount(chainId)],
      signAmino: async (signer: string, signDoc: StdSignDoc, signOptions?: SignOptions) => {
        return await this.signAmino(chainId, signer, signDoc, signOptions);
      }
    }
  }

  getOfflineSignerDirect(chainId: string): OfflineDirectSigner {
    return {
      getAccounts: async () => [await this.getAccount(chainId)],
      signDirect: async (signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions) => {
        return await this.signDirect(chainId, signer, signDoc, signOptions);
      }
    }
  }

  async signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<AminoSignResponse> {
    const result = await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: DEFAULT_SNAP_ID,
        request: {
          method: 'signAmino',
          params: {
            chain_id: chainId,
            sign_doc: signDoc,
            signer
          }
        },
      },
    });
    return result.data;
  }

  signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature> {
    throw new Error('Method not implemented.');
  }

  verifyArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async signDirect(chainId: string, signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions): Promise<DirectSignResponse> {
    const result = await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: DEFAULT_SNAP_ID,
        request: {
          method: 'signDirect',
          params: {
            chain_id: chainId,
            sign_doc: signDoc,
            signer
          }
        },
      },
    });
    return result.data
  }

  sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }

  async addSuggestChain(chain: Chain, assetLists: AssetList[]): Promise<void> {

    const chainInfo = getMetaMaskCosmosChainInfo(chain, assetLists[0]);

    await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: DEFAULT_SNAP_ID,
        request: {
          method: 'addChain',
          params: {
            chain_info: JSON.stringify(chainInfo),
          }
        },
      },
    });

    this.chains = await this.getChains()
  }

}
