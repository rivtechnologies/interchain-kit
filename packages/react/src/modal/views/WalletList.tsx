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

export const WalletListContent = () => {
  const walletManager = useWalletManager();
  const { close } = useWalletModal();

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

  const onWalletClick = async (wallet: any) => {
    try {
      await walletManager.connect(wallet.info.name);
      close();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ConnectModalWalletList
      wallets={wallets}
      onWalletItemClick={onWalletClick}
    />
  );
};
