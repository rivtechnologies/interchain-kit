import { ConnectModalHead, ConnectModalStatus } from "@interchain-ui/react";
import { useWalletManager } from "../../hooks"; // replace with the actual path
import { useWalletModal } from "../provider";
import { BaseWallet } from "@interchain-kit/core";
import { useMemo } from "react";
import { FaAndroid } from "@react-icons/all-files/fa/FaAndroid";
import { GoDesktopDownload } from "@react-icons/all-files/go/GoDesktopDownload";
import { GrFirefox } from "@react-icons/all-files/gr/GrFirefox";
import { RiAppStoreFill } from "@react-icons/all-files/ri/RiAppStoreFill";
import { RiChromeFill } from "@react-icons/all-files/ri/RiChromeFill";

export const NotExistHeader = ({
  wallet,
  onBack,
}: {
  wallet: BaseWallet;
  onBack: () => void;
}) => {
  const { close } = useWalletModal();
  return (
    <ConnectModalHead
      title={wallet?.info?.prettyName || ""}
      hasBackButton={true}
      onClose={close}
      onBack={onBack}
      closeButtonProps={{ onClick: close }}
    />
  );
};

export const NotExistContent = ({ wallet }: { wallet: BaseWallet }) => {
  const walletManager = useWalletManager();

  const downloadLink = useMemo(() => {
    return walletManager.getDownloadLink(wallet.info.name);
  }, [wallet?.info?.name]);

  const onInstall = () => {
    if (downloadLink) {
      window.open(downloadLink.link, "_blank");
    }
  };

  const IconComp = getIcon(walletManager.getEnv());

  return (
    <ConnectModalStatus
      status="NotExist"
      wallet={{
        name: wallet?.info?.prettyName,
        logo: typeof wallet?.info?.logo === "string" ? wallet?.info?.logo : "",
        mobileDisabled: true,
      }}
      contentHeader={`${wallet?.info?.prettyName} Not Installed`}
      contentDesc={
        true
          ? `If ${wallet?.info?.prettyName.toLowerCase()} is installed on your device, please refresh this page or follow the browser instruction.`
          : `Download link not provided. Try searching it or consulting the developer team.`
      }
      onInstall={onInstall}
      installIcon={<IconComp />}
      disableInstall={downloadLink === null}
    />
  );
};

function getIcon(env: { browser?: string; device?: string; os?: string }) {
  if (env?.browser === "chrome") return RiChromeFill;
  if (env?.browser === "firefox") return GrFirefox;
  if (env?.os === "android") return FaAndroid;
  if (env?.os === "ios") return RiAppStoreFill;
  return GoDesktopDownload;
}
