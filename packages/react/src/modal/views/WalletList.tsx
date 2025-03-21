import { ConnectModalHead, ConnectModalWalletList } from "@interchain-ui/react";
import { useWalletModal } from "../provider";
import { useWalletManager } from "../../hooks";
import { BaseWallet, isInstanceOf, WCWallet } from "@interchain-kit/core";
import { Wallet as InterchainUIWalletType } from "@interchain-ui/react";

export const WalletListHeader = () => {
  const { close } = useWalletModal();
  return (
    <ConnectModalHead
      title="Select your wallet"
      hasBackButton={false}
      onClose={close}
      closeButtonProps={{ onClick: close }}
    />
  );
};

export const WalletListContent = ({
  onSelectWallet,
}: {
  onSelectWallet: (wallet: BaseWallet) => void;
}) => {
  const walletManager = useWalletManager();

  const wallets: InterchainUIWalletType[] = walletManager.wallets.map(
    (w: BaseWallet) => {
      if (isInstanceOf(w, WCWallet) && w.session) {
        return {
          name: w.session.peer.metadata?.name,
          prettyName: `${w.session.peer.metadata?.name} - Mobile`,
          logo: w.session.peer.metadata?.icons?.[0],
          mobileDisabled: true,
          shape: "list" as "list",
          originalWallet: { ...w, session: w.session },
          subLogo: w.info.logo as string,
        };
      }
      return {
        name: w.info.name,
        prettyName: w.info.prettyName,
        logo: w.info.logo as string,
        mobileDisabled: true,
        shape: "list" as "list",
        originalWallet: {
          ...w,
          pairing: null,
          session: null,
        },
      };
    }
  );

  return (
    <ConnectModalWalletList
      wallets={wallets}
      onWalletItemClick={(w) => {
        onSelectWallet(w);
      }}
    />
  );
};
