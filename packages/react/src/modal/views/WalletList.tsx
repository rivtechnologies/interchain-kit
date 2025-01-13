import { ConnectModalHead, ConnectModalWalletList } from "@interchain-ui/react";
import { useWalletModal } from "../provider";
import { useWalletManager } from "../../hooks";
import { BaseWallet, WCWallet } from "@interchain-kit/core";
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
      return {
        name: w.info.name,
        prettyName: w.info.prettyName,
        logo: w.info.logo as string,
        mobileDisabled: true,
        shape: "list" as "list",
        originalWallet: {
          ...w,
          pairing: null,
        },
      };
    }
  );

  const wcWallet = walletManager.wallets.find(
    (w) => w.info.mode === "wallet-connect"
  ) as WCWallet;

  if (wcWallet) {
    const activePairings = wcWallet.getActivePairing();

    activePairings.forEach((pairing) => {
      wallets.push({
        name: pairing?.peerMetadata?.name,
        prettyName: pairing?.peerMetadata?.name,
        logo: pairing?.peerMetadata?.icons?.[0],
        mobileDisabled: true,
        shape: "list" as "list",
        originalWallet: { ...wcWallet, pairing },
        subLogo: wcWallet.info.logo as string,
      });
    });
  }

  return (
    <ConnectModalWalletList
      wallets={wallets}
      onWalletItemClick={onSelectWallet}
    />
  );
};
