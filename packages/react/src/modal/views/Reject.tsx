import { ConnectModalHead, ConnectModalStatus } from "@interchain-ui/react";
import { useWalletModal } from "../provider";
import { useWalletManager } from "../../hooks";
import { getWalletInfo } from "../../utils";
import { BaseWallet } from "@interchain-kit/core";

export const RejectHeader = ({
  wallet,
  onBack,
}: {
  wallet: BaseWallet;
  onBack: () => void;
}) => {
  const { close } = useWalletModal();
  return (
    <ConnectModalHead
      title={wallet.info.prettyName}
      hasBackButton={true}
      onClose={close}
      onBack={onBack}
      closeButtonProps={{ onClick: close }}
    />
  );
};

export const RejectContent = ({ wallet }: { wallet: BaseWallet }) => {
  const walletManager = useWalletManager();

  const { close } = useWalletModal();

  return (
    <ConnectModalStatus
      status="Rejected"
      wallet={getWalletInfo(wallet)}
      contentHeader={"Request Rejected"}
      contentDesc={wallet.errorMessage || "Connection permission is denied."}
      onConnect={() =>
        walletManager.connect(wallet.info.name, walletManager.currentChainName)
      }
    />
  );
};
