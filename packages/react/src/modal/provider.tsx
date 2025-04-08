import { createContext, useContext, useEffect, useState } from "react";
import { WalletModal } from "./modal";
import { WalletState } from "@interchain-kit/core";
import { useChainWallet, useWalletManager } from "../hooks";
import { Wallet as InterchainUIWalletType } from "@interchain-ui/react";
import { transferToWalletUISchema } from "../utils";

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

  const [walletNameToConnect, setWalletNameToConnect] = useState<string | null>(
    null
  );

  const {
    chains,
    wallets,
    setCurrentWalletName,
    currentChainName,
    currentWalletName,
    walletConnectQRCodeUri,
    getDownloadLink,
    getEnv,
  } = useWalletManager();

  const { wallet, status, connect, disconnect, username, address, message } =
    useChainWallet(currentChainName || chains[0].chainName, currentWalletName);

  const [shouldShowList, setShouldShowList] = useState(
    !(currentChainName && currentWalletName)
  );

  const walletsForUI: InterchainUIWalletType[] = wallets.map(
    transferToWalletUISchema
  );

  useEffect(() => {
    const handleConnect = async () => {
      if (walletNameToConnect) {
        try {
          await connect();
          setWalletNameToConnect(null);
          setShouldShowList(false);
        } catch (error) {
          console.error("Error connecting to wallet:", error);
          throw error;
        }
      }
    };
    handleConnect();
  }, [walletNameToConnect]);

  const handleCloseModal = () => {
    close();
    setShouldShowList(false);
  };

  return (
    <WalletModalContext.Provider value={{ modalIsOpen, open, close }}>
      {children}
      <WalletModal
        shouldShowList={shouldShowList}
        username={username}
        address={address}
        disconnect={disconnect}
        isOpen={modalIsOpen}
        open={open}
        close={handleCloseModal}
        wallets={walletsForUI}
        walletConnectQRCodeUri={walletConnectQRCodeUri}
        currentWallet={wallet?.originalWallet}
        isConnecting={status === WalletState.Connecting}
        isConnected={status === WalletState.Connected}
        isRejected={status === WalletState.Rejected}
        isDisconnected={status === WalletState.Disconnected}
        isNotExist={status === WalletState.NotExist}
        errorMessage={message}
        onSelectWallet={(w) => {
          setWalletNameToConnect(w.info.name);
          setCurrentWalletName(w.info.name);
        }}
        onBack={() => setShouldShowList(true)} // Add other required props with appropriate default or mock values
        onReconnect={connect}
        getDownloadLink={() => getDownloadLink(wallet?.info.name)}
        getEnv={getEnv}
      />
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
