import { ConnectModalHead, ConnectModalStatus } from "@interchain-ui/react"
import { useWalletModal } from "../provider"
import { useActiveWallet, useWalletManager } from "../../hooks"
import { getWalletInfo } from "../../utils"

export const RejectHeader = ({ onBack }: { onBack: () => void }) => {
  const { close } = useWalletModal()
  const activeWallet = useActiveWallet()
  return (
    <ConnectModalHead title={activeWallet.option.prettyName}
      hasBackButton={true}
      onClose={close}
      onBack={onBack}
      closeButtonProps={{ onClick: close }}
    />
  )
}


export const RejectContent = () => {

  const activeWallet = useActiveWallet()

  const walletManager = useWalletManager()

  const { close } = useWalletModal()

  return (
    <ConnectModalStatus
      status="Rejected"
      wallet={getWalletInfo(activeWallet)}
      contentHeader={'Request Rejected'}
      contentDesc={
        activeWallet.errorMessage || 'Connection permission is denied.'
      }
      onConnect={() => walletManager.connect(activeWallet.option.name).then(close)}
    />
  )
}