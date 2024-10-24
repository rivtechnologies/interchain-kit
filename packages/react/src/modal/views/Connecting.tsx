import { ConnectModalHead, ConnectModalStatus } from "@interchain-ui/react";
import { useCurrentWallet, useWalletManager } from "../../hooks";
import { useWalletModal } from "../provider";

export const ConnectingHeader = ({ onBack }: { onBack: () => void }) => {
  const currentWallet = useCurrentWallet();
  const { close } = useWalletModal();
  const walletManager = useWalletManager();
  if (!currentWallet) return null;
  return (
    <ConnectModalHead
      title={currentWallet.info.prettyName}
      hasBackButton={true}
      onClose={close}
      onBack={onBack}
      closeButtonProps={{
        onClick: async () => {
          await walletManager.disconnect(currentWallet.info.name);
          close();
        },
      }}
    />
  );
};

export const ConnectingContent = () => {
  const currentWallet = useCurrentWallet();
  const {
    info: { prettyName, mode },
  } = currentWallet;

  let title = "Requesting Connection";
  let desc: string =
    mode === "wallet-connect"
      ? `Approve ${prettyName} connection request on your mobile.`
      : `Open the ${prettyName} browser extension to connect your wallet.`;

  if (!currentWallet) return null;

  return (
    <ConnectModalStatus
      wallet={{
        name: currentWallet.info.name,
        prettyName: currentWallet.info.prettyName,
        logo: currentWallet.info.logo as string,
        mobileDisabled: true,
      }}
      status="Connecting"
      contentHeader={title}
      contentDesc={desc}
    />
  );
};
