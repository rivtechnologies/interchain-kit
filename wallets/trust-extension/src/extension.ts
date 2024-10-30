import { ExtensionWallet, WalletAccount } from '@interchain-kit/core';

export class TrustExtension extends ExtensionWallet {
  async connect(chainId: string | string[]): Promise<void> {
    try {
      console.log('connet', this.client)
      this.client.cosmos.enable(chainId)
    } catch (e) {
      console.error('TrustExtension connect error.', e);
    }
  }

  async getAccount(chainId: string) {
    const key = await this.client.cosmos.getKey(chainId);
    return {
      username: key.name,
      address: key.bech32Address,
      algo: key.algo,
      pubkey: key.pubKey,
    };
  }

  getOfflineSignerAmino(chainId: string) {
    return this.client.cosmos.getOfflineSignerAmino(chainId);
  }

  // trust extension has no disconnect method.
  async disconnect() {
    return;
  }
}
