import { ConnectModalHead, ConnectModalStatus } from "@interchain-ui/react"
import { useAccount, useActiveWallet, useWalletManager } from "../../hooks"
import { useWalletModal } from "../provider"
import React from "react"
import { getWalletInfo } from "../../utils"
import { AstronautSvg } from "./Astronaut"

export const ConnectedHeader = ({ onBack }: { onBack: () => void }) => {
  const activeWallet = useActiveWallet()
  const { close } = useWalletModal()
  return (
    <ConnectModalHead
      title={activeWallet?.option?.prettyName || ''}
      hasBackButton={true}
      onClose={close}
      onBack={onBack}
      closeButtonProps={{ onClick: close }}
    />
  )
}

export const ConnectedContent = () => {
  const activeWallet = useActiveWallet()
  const walletManager = useWalletManager()
  const account = useAccount(walletManager.chains[0].chainName, activeWallet?.option?.name)
  const { close } = useWalletModal()
  if (!activeWallet) {
    return null
  }
  return (
    <ConnectModalStatus
      wallet={getWalletInfo(activeWallet)}
      status={'Connected'}
      connectedInfo={{
        name: account?.username || 'Wallet',
        avatar: (
          <AstronautSvg
            style={{
              fontSize: 'inherit',
              width: '100%',
              height: '100%',
            }}
          />
        ),
        address: account?.address,
      }}
      onDisconnect={async () => {
        await walletManager.disconnect(activeWallet?.option?.name as string)
        close()
      }}
    />
  )
}