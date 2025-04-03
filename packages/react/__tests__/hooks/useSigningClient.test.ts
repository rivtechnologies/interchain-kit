import { renderHook, act } from "@testing-library/react"
import { useSigningClient } from "../../src/hooks/useSigningClient"
import { useWalletManager } from "../../src/hooks/useWalletManager"
import { WalletState } from "@interchain-kit/core"

jest.mock("../../src/hooks/useWalletManager")

describe("useSigningClient", () => {
    const mockGetSigningClient = jest.fn()
    const mockGetChainWalletState = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useWalletManager as jest.Mock).mockReturnValue({
                getSigningClient: mockGetSigningClient,
                getChainWalletState: mockGetChainWalletState,
            })
    })

    it("should initialize with default values", () => {
        mockGetChainWalletState.mockReturnValue({ walletState: WalletState.Disconnected })

        const { result } = renderHook(() => useSigningClient("test-chain", "test-wallet"))

        expect(result.current.signingClient).toBeNull()
        expect(result.current.error).toBeNull()
        expect(result.current.isLoading).toBe(false)
    })

    it("should not fetch signing client if wallet is not connected", async () => {
        mockGetChainWalletState.mockReturnValue({ walletState: WalletState.Disconnected })

        const { result } = renderHook(() => useSigningClient("test-chain", "test-wallet"))

        await act(async () => {
            // Wait for useEffect to run
        })

        expect(mockGetSigningClient).not.toHaveBeenCalled()
        expect(result.current.signingClient).toBeNull()
        expect(result.current.error).toBeNull()
        expect(result.current.isLoading).toBe(false)
    })

    it("should fetch signing client if wallet is connected", async () => {
        const mockClient = { client: "mockClient" }
        mockGetChainWalletState.mockReturnValue({ walletState: WalletState.Connected })
        mockGetSigningClient.mockResolvedValue(mockClient)

        const { result } = renderHook(() => useSigningClient("test-chain", "test-wallet"))

        await act(async () => {
            // Wait for useEffect to run
        })

        expect(mockGetSigningClient).toHaveBeenCalledWith("test-wallet", "test-chain")
        expect(result.current.signingClient).toEqual(mockClient)
        expect(result.current.error).toBeNull()
        expect(result.current.isLoading).toBe(false)
    })

    it("should handle errors when fetching signing client fails", async () => {
        const mockError = new Error("Failed to fetch signing client")
        mockGetChainWalletState.mockReturnValue({ walletState: WalletState.Connected })
        mockGetSigningClient.mockRejectedValue(mockError)

        const { result } = renderHook(() => useSigningClient("test-chain", "test-wallet"))

        await act(async () => {
            // Wait for useEffect to run
        })

        expect(mockGetSigningClient).toHaveBeenCalledWith("test-wallet", "test-chain")
        expect(result.current.signingClient).toBeNull()
        expect(result.current.error).toBe(mockError.message)
        expect(result.current.isLoading).toBe(false)
    })
})