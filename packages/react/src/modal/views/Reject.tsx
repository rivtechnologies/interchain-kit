import { ConnectModalHead, ConnectModalStatus } from "@interchain-ui/react";
import { getWalletInfo } from "../../utils";
import { StatefulWallet } from "../../store/stateful-wallet";

export const RejectHeader = ({
  wallet,
  close,
  onBack,
}: {
  wallet: StatefulWallet;
  close: () => void;
  onBack: () => void;
}) => {
  return (
    <ConnectModalHead
      title={wallet?.info?.prettyName}
      hasBackButton={true}
      onClose={close}
      onBack={onBack}
      closeButtonProps={{ onClick: close }}
    />
  );
};

export const RejectContent = ({
  wallet,
  onReconnect,
}: {
  wallet: StatefulWallet;
  onReconnect: () => void;
}) => {
  return (
    <ConnectModalStatus
      status="Rejected"
      wallet={getWalletInfo(wallet)}
      contentHeader={"Request Rejected"}
      contentDesc={wallet.errorMessage || "Connection permission is denied."}
      onConnect={onReconnect}
    />
  );
};
