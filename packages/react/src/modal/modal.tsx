import {
  ConnectedContent,
  ConnectedHeader,
  ConnectingContent,
  ConnectingHeader,
  NotExistContent,
  NotExistHeader,
  QRCodeContent,
  QRCodeHeader,
  RejectContent,
  RejectHeader,
  WalletListContent,
  WalletListHeader,
} from "./views";
import { useWalletModal } from "./provider";
import { useChainWallet, useWalletManager } from "../hooks";
import { useEffect, useMemo, useState } from "react";
import { ExtensionWallet, WalletState, WCWallet } from "@interchain-kit/core";
import { ConnectModal } from "@interchain-ui/react";

type ModalType =
  | "wallet-list"
  | "connecting"
  | "connected"
  | "reject"
  | "not-exist"
  | "qr-code";

export const WalletModal = () => {
  const {
    currentWalletName,
    currentChainName,
    wallets,
    connect,
    getAccount,
    setCurrentWalletName,
    walletConnectQRCodeUri,
  } = useWalletManager();

  const { modalIsOpen, open, close } = useWalletModal();
  const [modalType, setModalType] = useState<ModalType>("wallet-list");
  const [selectedWallet, setSelectedWallet] = useState<any>(null);

  const { chain, status, wallet } = useChainWallet(
    currentChainName,
    currentWalletName
  );

  const handleConnect = async () => {
    try {
      await connect(selectedWallet?.info?.name, chain.chainName);
      await getAccount(selectedWallet?.info?.name, chain.chainName);
      setSelectedWallet(null);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  useEffect(() => {
    if (selectedWallet && currentWalletName && currentChainName) {
      handleConnect();
    }
  }, [selectedWallet]);

  const handleSelectWallet = async (selectedWallet: any) => {
    setSelectedWallet(selectedWallet);
    setCurrentWalletName(selectedWallet?.info?.name);
  };

  useEffect(() => {
    if (!selectedWallet) {
      setModalType("wallet-list");
    }
    if (currentWalletName && currentChainName) {
      if (status === WalletState.Connecting) {
        setModalType("connecting");
      }
      if (status === WalletState.Connected) {
        setModalType("connected");
      }
      if (status === WalletState.Rejected) {
        setModalType("reject");
      }
      if (status === WalletState.Disconnected) {
        setModalType("wallet-list");
      }
      if (walletConnectQRCodeUri) {
        setModalType("qr-code");
      }
    }
  }, [
    currentWalletName,
    currentChainName,
    status,
    modalIsOpen,
    selectedWallet,
    walletConnectQRCodeUri,
  ]);

  const goBackList = () => setModalType("wallet-list");

  const { header, content } = useMemo(() => {
    switch (modalType) {
      case "wallet-list":
        return {
          header: <WalletListHeader />,
          content: <WalletListContent onSelectWallet={handleSelectWallet} />,
        };
      case "connecting":
        return {
          header: <ConnectingHeader wallet={wallet} onBack={goBackList} />,
          content: <ConnectingContent wallet={wallet} />,
        };
      case "connected":
        return {
          header: <ConnectedHeader wallet={wallet} onBack={goBackList} />,
          content: <ConnectedContent afterDisconnect={goBackList} />,
        };
      case "reject":
        return {
          header: <RejectHeader wallet={wallet} onBack={goBackList} />,
          content: (
            <RejectContent
              wallet={wallet}
              onReconnect={() => {
                setModalType("connecting");
                wallet.connect(chain.chainId);
                wallet.getAccount(chain.chainId);
              }}
            />
          ),
        };
      case "not-exist":
        return {
          header: <NotExistHeader wallet={wallet} onBack={goBackList} />,
          content: <NotExistContent wallet={wallet} />,
        };
      case "qr-code":
        return {
          header: <QRCodeHeader onBack={goBackList} />,
          content: <QRCodeContent />,
        };
    }
  }, [modalType]);

  return (
    <ConnectModal
      isOpen={modalIsOpen}
      header={header}
      onOpen={open}
      onClose={close}
    >
      {content}
    </ConnectModal>
  );
};
