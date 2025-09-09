import { ExtensionWallet } from '@interchain-kit/core';

export class LeapWallet extends ExtensionWallet {
  async connect(chainId: string | string[]): Promise<void> {
    await this.client.enable(chainId);
    const targetChain = Array.isArray(chainId) ? chainId : [chainId];
    const isConnected = await Promise.all(targetChain.map(async (chainId) => this.client.isConnected(chainId)));
    if (isConnected.every(c => c === true)) {
      return Promise.resolve();
    } else {
      throw (new Error('Failed to connect to Leap'));
    }
  }


  async disconnect(chainId: string | string[]): Promise<void> {
    const targetChain = Array.isArray(chainId) ? chainId : [chainId];
    await Promise.all(targetChain.map(async (chainId) => this.client.disconnect(chainId)));
  }
}