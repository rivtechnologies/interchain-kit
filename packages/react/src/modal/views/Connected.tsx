import { ConnectModalHead, ConnectModalStatus } from "@interchain-ui/react";
import { useAccount, useCurrentWallet, useWalletManager } from "../../hooks";
import { useWalletModal } from "../provider";
import { getWalletInfo } from "../../utils";
import { AstronautSvg } from "./Astronaut";
import { useCurrentChainWallet } from "../../hooks/useCurrentChainWallet";

export const ConnectedHeader = ({ onBack }: { onBack: () => void }) => {
  const currentWallet = useCurrentChainWallet();
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

export const ConnectedContent = () => {
  const currentWallet = useCurrentChainWallet();

  const walletManager = useWalletManager();

  const { account } = useAccount(
    walletManager.currentChainName,
    currentWallet?.info?.name
  );
  const { close } = useWalletModal();
  if (!currentWallet) {
    return null;
  }
  return (
    <ConnectModalStatus
      wallet={getWalletInfo(currentWallet)}
      status={"Connected"}
      connectedInfo={{
        name: account?.username || "Wallet",
        avatar: (
          <AstronautSvg
            style={{
              fontSize: "inherit",
              width: "100%",
              height: "100%",
            }}
          />
        ),
        address: account?.address,
      }}
      onDisconnect={async () => {
        await currentWallet.disconnect();
        close();
      }}
    />
  );
};
