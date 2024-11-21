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
import {
  BaseWallet,
  ExtensionWallet,
  WalletState,
  WCWallet,
} from "@interchain-kit/core";
import { ConnectModal } from "@interchain-ui/react";

export const WalletModal = () => {
  const { modalIsOpen, open, close } = useWalletModal();

  const currentWallet = useCurrentWallet();

  const walletManager = useWalletManager();

  const handleSelectWallet = async (wallet: any) => {
    const selectedWallet = walletManager.getWalletByName(
      (wallet as BaseWallet).info.name
    );

    setModalView({
      header: <ConnectingHeader wallet={wallet} onBack={gotoWalletList} />,
      content: <ConnectingContent wallet={wallet} />,
    });

    if (
      selectedWallet.info.mode === "extension" &&
      !(selectedWallet as ExtensionWallet).isExtensionInstalled
    ) {
      setModalView({
        header: (
          <NotExistHeader wallet={selectedWallet} onBack={gotoWalletList} />
        ),
        content: <NotExistContent wallet={selectedWallet} />,
      });
      return;
    }

    try {
      if (selectedWallet.info.mode === "wallet-connect") {
        (selectedWallet as WCWallet).setPairingToConnect(wallet.pairing);

        selectedWallet.events.on(
          "displayWalletConnectQRCodeUri",
          (uri: string) => {
            if (uri) {
              setModalView({
                header: <QRCodeHeader onBack={gotoWalletList} />,
                content: <QRCodeContent />,
              });
            }
          }
        );
      }

      await walletManager.connect(selectedWallet?.info?.name);

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
