import { ConnectModalHead, ConnectModalStatus } from "@interchain-ui/react";
import { useAccount, useCurrentWallet } from "../../hooks";
import { useWalletModal } from "../provider";
import { getWalletInfo } from "../../utils";
import { AstronautSvg } from "./Astronaut";

export const ConnectedHeader = ({ onBack }: { onBack: () => void }) => {
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

export const ConnectedContent = () => {
  const currentWallet = useCurrentWallet();

  const chainAccount = currentWallet?.getChainAccountByName?.(
    currentWallet.currentChainName
  );
  const { account } = useAccount(
    currentWallet.currentChainName,
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
        await chainAccount.disconnect();
        close();
      }}
    />
  );
};
