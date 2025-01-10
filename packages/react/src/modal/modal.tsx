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
import { useCurrentChainWallet } from "../hooks/useCurrentChainWallet";

export const WalletModal = () => {
  const { modalIsOpen, open, close } = useWalletModal();

  const walletManager = useWalletManager();

  const handleSelectWallet = async (wallet: any) => {
    walletManager.currentWalletName = wallet.info.name;

    const currentWallet = walletManager
      .getWalletRepositoryByName(wallet.info.name)
      .getChainAccountByName(walletManager.currentChainName);
    console.log(
      wallet.info.name,
      walletManager.currentChainName,
      Boolean(currentWallet)
    );
    setModalView({
      header: <ConnectingHeader wallet={wallet} onBack={gotoWalletList} />,
      content: <ConnectingContent wallet={wallet} />,
    });

    if (
      currentWallet?.wallet?.info.mode === "extension" &&
      !(currentWallet?.wallet as ExtensionWallet).isExtensionInstalled
    ) {
      setModalView({
        header: (
          <NotExistHeader wallet={currentWallet} onBack={gotoWalletList} />
        ),
        content: <NotExistContent wallet={currentWallet} />,
      });
      return;
    }

    try {
      if (currentWallet?.wallet?.info.mode === "wallet-connect") {
        (
          currentWallet?.wallet as unknown as WCWallet
        ).setOnPairingUriCreatedCallback(() => {
          setModalView({
            header: <QRCodeHeader onBack={gotoWalletList} />,
            content: <QRCodeContent />,
          });
        });

        (currentWallet?.wallet as unknown as WCWallet).setPairingToConnect(
          wallet.pairing
        );
      }

      await currentWallet?.connect();
      await currentWallet?.getAccount();

      setModalView({
        header: <ConnectedHeader onBack={gotoWalletList} />,
        content: <ConnectedContent />,
      });
    } catch (error) {
      console.log(error);
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

  const currentWallet = useCurrentChainWallet();

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
