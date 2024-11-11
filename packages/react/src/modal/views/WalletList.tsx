import { ConnectModalHead, ConnectModalWalletList } from "@interchain-ui/react";
import { useWalletModal } from "../provider";
import { useWalletManager } from "../../hooks";
import { BaseWallet } from "@interchain-kit/core";

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

  const wallets = walletManager.wallets.map((w: BaseWallet) => {
    return {
      name: w.info.name,
      prettyName: w.info.prettyName,
      logo: w.info.logo as string,
      mobileDisabled: true,
      shape: "list" as "list",
      originalWallet: w,
    };
  });

  return (
    <ConnectModalWalletList
      wallets={wallets}
      onWalletItemClick={onSelectWallet}
    />
  );
};
