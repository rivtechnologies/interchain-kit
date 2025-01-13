import { ConnectModalHead, ConnectModalQRCode } from "@interchain-ui/react";
import { WCWallet } from "@interchain-kit/core";
import { useWalletManager } from "../../hooks";
import { useWalletModal } from "../provider";

export const QRCodeHeader = ({ onBack }: { onBack: () => void }) => {
  const { currentChainName, currentWalletName, getWalletByName, disconnect } =
    useWalletManager();
  const { close } = useWalletModal();
  const currentWallet = getWalletByName(currentWalletName);
  return (
    <ConnectModalHead
      title={currentWallet?.info?.prettyName || ""}
      hasBackButton={true}
      onClose={() => void 0}
      onBack={async () => {
        await disconnect(currentWallet?.info?.name || "", currentChainName);
        onBack();
      }}
      closeButtonProps={{ onClick: close }}
    />
  );
};
export const QRCodeContent = () => {
  const { currentChainName, currentWalletName, getWalletByName, connect } =
    useWalletManager();

  const currentWallet = getWalletByName(currentWalletName) as WCWallet;

  const data = currentWallet.pairingUri;

  return (
    <ConnectModalQRCode
      status={data ? "Done" : "Pending"}
      link={data}
      description={"Open App to connect"}
      errorTitle={"errorTitle"}
      errorDesc={currentWallet.errorMessage || ""}
      onRefresh={() =>
        connect(currentWallet?.info?.name || "", currentChainName)
      }
    />
  );
};
