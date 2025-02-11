import { ConnectModalHead, ConnectModalStatus } from "@interchain-ui/react";
import { useChainWallet, useWalletManager } from "../../hooks";
import { useWalletModal } from "../provider";
import { getWalletInfo } from "../../utils";
import { AstronautSvg } from "./Astronaut";
import { BaseWallet } from "@interchain-kit/core";

export const ConnectedHeader = ({
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

export const ConnectedContent = ({
  afterDisconnect,
}: {
  afterDisconnect: () => void;
}) => {
  const { currentChainName, currentWalletName } = useWalletManager();

  const { address, username, wallet } = useChainWallet(
    currentChainName,
    currentWalletName
  );

  const { close } = useWalletModal();
  if (!wallet) {
    return null;
  }
  return (
    <ConnectModalStatus
      wallet={getWalletInfo(wallet)}
      status={"Connected"}
      connectedInfo={{
        name: username || "Wallet",
        avatar: (
          <AstronautSvg
            style={{
              fontSize: "inherit",
              width: "100%",
              height: "100%",
            }}
          />
        ),
        address: address,
      }}
      onDisconnect={async () => {
        await wallet.disconnect(currentChainName);
        afterDisconnect();
      }}
    />
  );
};
