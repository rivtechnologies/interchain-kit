/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react-hooks"
import { useChainWallet } from "../../src/hooks/useChainWallet"
import { useWalletManager } from "../../src/hooks/useWalletManager"
import { ChainWallet } from "../../src/store/chain-wallet"
import { InterchainStore } from "../../src/store"
import { MockWallet } from "../helpers/mock-wallet"
import { WalletState } from "@interchain-kit/core"
import { SigningClient } from "../../src/types/sign-client"

// Mock the useWalletManager hook
jest.mock("../../src/hooks/useWalletManager", () => ({
    useWalletManager: jest.fn(),
}))

describe("useChainWallet", () => {

    const mockWallet = new MockWallet({ name: 'test-wallet', mode: 'extension', prettyName: 'Test Wallet' });

    const mockWalletManager: jest.Mocked<InterchainStore> = {
        chains: [{ chainName: 'test-chain', chainType: 'cosmos' as const }],
        assetLists: [{ chainName: 'test-chain', assets: [] }],
        wallets: [mockWallet],
        currentWalletName: 'test-wallet',
        currentChainName: 'test-chain',
        chainWalletState: [],
        walletConnectQRCodeUri: '',
        signerOptions: {},
        signerOptionMap: {},
        endpointOptions: {},
        endpointOptionsMap: {},
        preferredSignTypeMap: {},
        init: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
        addChains: jest.fn(),
        setCurrentChainName: jest.fn(),
        setCurrentWalletName: jest.fn(),
        getChainByName: jest.fn().mockReturnValue({ name: 'test-chain' }),
        getDraftChainWalletState: jest.fn(),
        updateChainWalletState: jest.fn(),
        getAssetListByName: jest.fn(),
        getPreferSignType: jest.fn(),
        getSignerOptions: jest.fn(),
        getOfflineSigner: jest.fn(),
        getWalletByName: jest.fn(),
        getChainWalletState: jest.fn(),
        getChainLogoUrl: jest.fn(),
        getSigningClient: jest.fn(),
        getRpcEndpoint: jest.fn(),
        getAccount: jest.fn(),
        getEnv: jest.fn(),
        getDownloadLink: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useWalletManager as jest.Mock).mockReturnValue(mockWalletManager)
    })

    it("should return the correct chain and wallet data", () => {
        const chainName = "test-chain"
        const walletName = "test-wallet"

        const mockChain = { chainName: 'test-chain', chainType: 'cosmos' as const };

        const mockChainWalletState = {
            walletState: WalletState.Connected,
            account: { username: "test-user", address: "test-address", algo: "secp256k1" as const, pubkey: new Uint8Array() },
            errorMessage: '',
            rpcEndpoint: "http://localhost:26657",
            chainName: "test-chain",
            walletName: "test-wallet",
        }

        mockWalletManager.getChainByName.mockReturnValue(mockChain)
        mockWalletManager.getWalletByName.mockReturnValue(mockWallet)
        mockWalletManager.getChainWalletState.mockReturnValue(mockChainWalletState)
        mockWalletManager.getChainLogoUrl.mockReturnValue("http://logo.url")

        const { result } = renderHook(() => useChainWallet(chainName, walletName))

        expect(result.current.chain).toEqual(mockChain)
        expect(result.current.wallet).toBeInstanceOf(ChainWallet)
        expect(result.current.assetList).toEqual(mockWalletManager.assetLists[0])
        expect(result.current.status).toBe(WalletState.Connected)
        expect(result.current.username).toBe("test-user")
        expect(result.current.address).toBe("test-address")
        expect(result.current.message).toBe("")
        expect(result.current.rpcEndpoint).toBe("http://localhost:26657")
        expect(result.current.logoUrl).toBe("http://logo.url")
    })

    it("should call connect and getAccount when connect is invoked", async () => {
        const chainName = "test-chain"
        const walletName = "test-wallet"

        const { result } = renderHook(() => useChainWallet(chainName, walletName))

        await result.current.connect()

        expect(mockWalletManager.setCurrentWalletName).toHaveBeenCalledWith(walletName)
        expect(mockWalletManager.setCurrentChainName).toHaveBeenCalledWith(chainName)
        expect(mockWalletManager.connect).toHaveBeenCalledWith(walletName, chainName)
        expect(mockWalletManager.getAccount).toHaveBeenCalledWith(walletName, chainName)
    })

    it("should call disconnect when disconnect is invoked", () => {
        const chainName = "test-chain"
        const walletName = "test-wallet"

        const { result } = renderHook(() => useChainWallet(chainName, walletName))

        result.current.disconnect()

        expect(mockWalletManager.disconnect).toHaveBeenCalledWith(walletName, chainName)
    })

    it("should return the correct RPC endpoint", async () => {
        const chainName = "test-chain"
        const walletName = "test-wallet"

        mockWalletManager.getRpcEndpoint.mockResolvedValue("http://localhost:26657")

        const { result } = renderHook(() => useChainWallet(chainName, walletName))

        const endpointResult = await result.current.getRpcEndpoint()

        expect(endpointResult).toBe("http://localhost:26657")
    })

    it("should return the signing client", () => {
        const chainName = "test-chain"
        const walletName = "test-wallet"

        const mockSigningClient: any = {
        }

        mockWalletManager.getSigningClient.mockReturnValue(mockSigningClient)

        const { result } = renderHook(() => useChainWallet(chainName, walletName))

        expect(result.current.getSigningClient()).toBe(mockSigningClient)
    })
})