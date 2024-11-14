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
import { useCurrentWallet, useWalletManager } from "../hooks";
import { useEffect, useMemo, useState } from "react";
import { BaseWallet, ExtensionWallet, WalletState } from "@interchain-kit/core";
import { ConnectModal } from "@interchain-ui/react";

export const WalletModal = () => {
  const { modalIsOpen, open, close } = useWalletModal();

  const currentWallet = useCurrentWallet();

  const walletManager = useWalletManager();

  const handleSelectWallet = async (wallet: BaseWallet) => {
    setModalView({
      header: <ConnectingHeader wallet={wallet} onBack={gotoWalletList} />,
      content: <ConnectingContent wallet={wallet} />,
    });

    if (
      wallet.info.mode === "extension" &&
      !(wallet as ExtensionWallet).isExtensionInstalled
    ) {
      setModalView({
        header: <NotExistHeader wallet={wallet} onBack={gotoWalletList} />,
        content: <NotExistContent wallet={wallet} />,
      });
      return;
    }

    try {
      if (wallet.info.mode === "wallet-connect") {
        wallet.events.on("displayWalletConnectQRCodeUri", (uri: string) => {
          setModalView({
            header: <QRCodeHeader onBack={gotoWalletList} />,
            content: <QRCodeContent />,
          });
        });
      }

      await walletManager.connect(wallet?.info?.name);

      setModalView({
        header: <ConnectedHeader onBack={gotoWalletList} />,
        content: <ConnectedContent />,
      });
    } catch (error) {
      setModalView({
        header: <RejectHeader wallet={wallet} onBack={gotoWalletList} />,
        content: <RejectContent wallet={wallet} />,
      });
    }
  };

  const defaultModalView = useMemo(() => {
    return {
      header: <WalletListHeader />,
      content: <WalletListContent onSelectWallet={handleSelectWallet} />,
    };
  }, []);

  const [modalView, setModalView] = useState(defaultModalView);

  const gotoWalletList = () => setModalView(defaultModalView);

  useEffect(() => {
    if (modalIsOpen && currentWallet?.walletState === WalletState.Connected) {
      setModalView({
        header: <ConnectedHeader onBack={gotoWalletList} />,
        content: <ConnectedContent />,
      });
    } else {
      setModalView(defaultModalView);
    }
  }, [modalIsOpen]);

  return (
    <ConnectModal
      isOpen={modalIsOpen}
      header={modalView.header}
      onOpen={open}
      onClose={close}
    >
      {modalView.content}
    </ConnectModal>
  );
};
