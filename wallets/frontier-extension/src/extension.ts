import { ExtensionWallet, WalletAccount } from '@interchain-kit/core';

export class FrontierExtension extends ExtensionWallet {
  async connect(chainId: string | string[]): Promise<void> {
    try {
      await this.client.cosmos.enable(chainId);
    } catch (e) {
      console.error('FrontierExtension connect error.', e);
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
    return this.client.cosmos.getOfflineSignerOnlyAmino(chainId);
  }

  async disconnect() {
    return;
  }
}
