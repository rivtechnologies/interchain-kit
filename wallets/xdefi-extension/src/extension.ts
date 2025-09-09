import { ExtensionWallet } from '@interchain-kit/core';

export class XdefiWallet extends ExtensionWallet {
  async connect(chainId: string | string[]): Promise<void> {
    try {
      await this.client.enable(chainId);
    } catch (error) {
      if ((error as any).includes('not supported')) {
        throw new Error(`There is no chain info for ${chainId}`);
      }
      throw error;
    }
  }
}