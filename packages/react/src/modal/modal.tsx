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
import { useEffect, useState } from "react";
import { ExtensionWallet, WalletState, WCWallet } from "@interchain-kit/core";
import { ConnectModal } from "@interchain-ui/react";

export const WalletModal = () => {
  const { modalIsOpen, open, close } = useWalletModal();

  const {
    currentWalletName,
    currentChainName,
    wallets,
    setCurrentWalletName,
    connect,
    getAccount,
    getWalletByName,
  } = useWalletManager();

  const handleSelectWallet = async (selectedWallet: any) => {
    const walletToView = wallets.find(
      (w) => w.info.name === selectedWallet.info.name
    );

    setCurrentWalletName(selectedWallet.info.name);

    setModalView({
      header: (
        <ConnectingHeader wallet={walletToView} onBack={gotoWalletList} />
      ),
      content: <ConnectingContent wallet={walletToView} />,
    });

    if (
      walletToView?.info.mode === "extension" &&
      !(walletToView as ExtensionWallet).isExtensionInstalled
    ) {
      setModalView({
        header: (
          <NotExistHeader wallet={walletToView} onBack={gotoWalletList} />
        ),
        content: <NotExistContent wallet={walletToView} />,
      });
      return;
    }

    try {
      if (walletToView?.info.mode === "wallet-connect") {
        (walletToView as unknown as WCWallet).setOnPairingUriCreatedCallback(
          () => {
            setModalView({
              header: <QRCodeHeader onBack={gotoWalletList} />,
              content: <QRCodeContent />,
            });
          }
        );

        (walletToView as unknown as WCWallet).setPairingToConnect(
          wallet.pairing
        );
      }
      console.log({ currentChainName });
      await connect(selectedWallet.info.name, currentChainName);
      await getAccount(selectedWallet.info.name, currentChainName);

      setModalView({
        header: (
          <ConnectedHeader wallet={walletToView} onBack={gotoWalletList} />
        ),
        content: <ConnectedContent />,
      });
    } catch (error) {
      console.log(error);
      setModalView({
        header: <RejectHeader wallet={walletToView} onBack={gotoWalletList} />,
        content: <RejectContent wallet={walletToView} />,
      });
    }
  };

  const defaultModalView = {
    header: <WalletListHeader />,
    content: <WalletListContent onSelectWallet={handleSelectWallet} />,
  };

  const [modalView, setModalView] = useState(defaultModalView);

  const gotoWalletList = () => setModalView(defaultModalView);

  const { status } = useChainWallet(currentChainName, currentWalletName);

  useEffect(() => {
    const currentWallet = getWalletByName(currentWalletName);

    if (modalIsOpen && status === WalletState.Connected) {
      setModalView({
        header: (
          <ConnectedHeader wallet={currentWallet} onBack={gotoWalletList} />
        ),
        content: <ConnectedContent />,
      });
    } else {
      setModalView(defaultModalView);
    }
  }, [modalIsOpen, status]);

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
