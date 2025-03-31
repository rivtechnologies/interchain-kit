import { ExtensionWallet } from "../../src/wallets/extension-wallet";
import { clientNotExistError, getClientFromExtension } from "../../src/utils";
import { MultiChainWallet } from "../../src/wallets/multichain-wallet";

jest.mock("../../src/utils", () => ({
    clientNotExistError: new Error("Client does not exist"),
    getClientFromExtension: jest.fn(),
}));

describe("ExtensionWallet", () => {
    let extensionWallet: ExtensionWallet;

    beforeEach(() => {
        extensionWallet = new ExtensionWallet({
            walletIdentifyKey: "test-key",
            name: "Test Wallet",
            mode: 'extension',
            prettyName: "Test Pretty Wallet",
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should initialize successfully when getClientFromExtension returns a walletIdentify", async () => {
        (getClientFromExtension as jest.Mock).mockResolvedValue("walletIdentify");

        await extensionWallet.init();

        expect(getClientFromExtension).toHaveBeenCalledWith("test-key");
    });

    it("should throw an error when getClientFromExtension returns null", async () => {
        (getClientFromExtension as jest.Mock).mockResolvedValue(null);

        await expect(extensionWallet.init()).rejects.toThrow(clientNotExistError);

        // expect(getClientFromExtension).toHaveBeenCalledWith("test-key");
        // expect(MultiChainWallet.prototype.init).not.toHaveBeenCalled();
    });
});