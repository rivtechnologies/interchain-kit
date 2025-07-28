import { rivWallet } from '../src';

describe('RIV Wallet', () => {
    it('should have correct info', () => {
        expect(rivWallet.info.name).toBe('riv-wallet-extension');
        expect(rivWallet.info.prettyName).toBe('RIV Wallet');
    });
});