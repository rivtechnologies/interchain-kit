import React from "react";
import { ConnectModalHead, ConnectModalStatus } from "@interchain-ui/react";
import { useCurrentWallet } from "../../hooks"; // replace with the actual path
import { useWalletModal } from "../provider";

export const NotExistHeader = ({ onBack }: { onBack: () => void }) => {
  const currentWallet = useCurrentWallet();
  const { close } = useWalletModal();
  return (
    <ConnectModalHead
      title={currentWallet?.info?.prettyName || ""}
      hasBackButton={true}
      onClose={close}
      onBack={onBack}
      closeButtonProps={{ onClick: close }}
    />
  );
};

export const NotExistContent = () => {
  const currentWallet = useCurrentWallet();

  const onInstall = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    let downloadLink = "";

    const downloadInfo = currentWallet?.info?.downloads?.find((d) =>
      userAgent.includes(d.browser as string)
    );

    if (downloadLink) {
      window.open(downloadLink, "_blank");
    }
  };
  return (
    <ConnectModalStatus
      status="NotExist"
      wallet={{
        name: currentWallet?.info?.name || "",
        logo:
          typeof currentWallet?.info?.logo === "string"
            ? currentWallet?.info?.logo
            : "",
        mobileDisabled: true,
      }}
      contentHeader={`${currentWallet?.info?.prettyName} Not Installed`}
      contentDesc={
        true
          ? `If ${currentWallet?.info?.prettyName.toLowerCase()} is installed on your device, please refresh this page or follow the browser instruction.`
          : `Download link not provided. Try searching it or consulting the developer team.`
      }
      onInstall={onInstall}
      installIcon={<div>xxx</div>}
      disableInstall={true}
    />
  );
};
