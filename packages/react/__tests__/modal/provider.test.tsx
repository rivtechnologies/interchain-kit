import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { WalletModalProvider, useWalletModal } from "../../src/modal/provider";
import "@testing-library/jest-dom";
import { ChainProvider } from "../../src/provider";
import { chain, assetList } from "@chain-registry/v2/mainnet/cosmoshub";

const TestComponent = () => {
  const { modalIsOpen, open, close } = useWalletModal();

  return (
    <div>
      <button onClick={open}>Open Modal</button>
      <button onClick={close}>Close Modal</button>
      {modalIsOpen && <div data-testid="modal">Modal is Open</div>}
    </div>
  );
};

describe("WalletModalProvider", () => {
  it("should render children correctly", () => {
    render(
      <ChainProvider chains={[chain]} assetLists={[assetList]} wallets={[]}>
        <WalletModalProvider>
          <div>Test Child</div>
        </WalletModalProvider>
      </ChainProvider>
    );

    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("should open and close the modal", () => {
    render(
      <ChainProvider chains={[chain]} assetLists={[assetList]} wallets={[]}>
        <WalletModalProvider>
          <TestComponent />
        </WalletModalProvider>
      </ChainProvider>
    );

    const openButton = screen.getByText("Open Modal");
    const closeButton = screen.getByText("Close Modal");

    // Modal should not be visible initially
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();

    // Open the modal
    fireEvent.click(openButton);
    expect(screen.getByTestId("modal")).toBeInTheDocument();

    // Close the modal
    fireEvent.click(closeButton);
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  it("should throw an error if useWalletModal is used outside WalletModalProvider", () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      "useWalletModal must be used within a WalletModalProvider"
    );

    consoleErrorSpy.mockRestore();
  });
});
