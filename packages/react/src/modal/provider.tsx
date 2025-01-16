import { createContext, useContext, useState } from "react";
import { WalletModal } from "./modal";

type WalletModalContextType = {
  modalIsOpen: boolean;
  open: () => void;
  close: () => void;
};

const WalletModalContext = createContext<WalletModalContextType | null>(null);

export const WalletModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const open = () => setModalIsOpen(true);
  const close = () => setModalIsOpen(false);

  return (
    <WalletModalContext.Provider value={{ modalIsOpen, open, close }}>
      {children}
      <WalletModal />
    </WalletModalContext.Provider>
  );
};

export const useWalletModal = () => {
  const context = useContext(WalletModalContext);
  if (!context) {
    throw new Error("useWalletModal must be used within a WalletModalProvider");
  }
  return context;
};
