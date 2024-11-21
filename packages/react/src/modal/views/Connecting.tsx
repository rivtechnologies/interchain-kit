import { ConnectModalHead, ConnectModalStatus } from "@interchain-ui/react";
import { useWalletManager } from "../../hooks";
import { useWalletModal } from "../provider";
import { BaseWallet } from "@interchain-kit/core";

export const ConnectingHeader = ({
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
      closeButtonProps={{
        onClick: close,
      }}
    />
  );
};

export const ConnectingContent = ({ wallet }: { wallet: BaseWallet }) => {
  const {
    info: { prettyName, mode },
  } = wallet;

  let title = "Requesting Connection";
  let desc: string =
    mode === "wallet-connect"
      ? `Approve ${prettyName} connection request on your mobile.`
      : `Open the ${prettyName} browser extension to connect your wallet.`;

  if (!wallet) return null;

  return (
    <ConnectModalStatus
      wallet={{
        name: wallet.info.name,
        prettyName: wallet.info.prettyName,
        logo: wallet.info.logo as string,
        mobileDisabled: true,
      }}
      status="Connecting"
      contentHeader={title}
      contentDesc={desc}
    />
  );
};
