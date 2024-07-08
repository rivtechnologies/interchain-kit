import { ExtensionWallet } from '@interchain-kit/core'
export class OkxWallet extends ExtensionWallet {
  async disable(chainId: string | string[]): Promise<void> {
    await this.client.disconnect()
  }
}

