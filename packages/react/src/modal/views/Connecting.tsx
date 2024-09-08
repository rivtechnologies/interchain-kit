import { ConnectModalHead, ConnectModalStatus } from '@interchain-ui/react';
import { useActiveWallet, useWalletManager } from '../../hooks';
import { useWalletModal } from '../provider';

export const ConnectingHeader = ({ onBack }: { onBack: () => void }) => {
  const wallet = useActiveWallet()
  const { close } = useWalletModal()
  const walletManager = useWalletManager()
  if (!wallet) return null
  return (
    <ConnectModalHead
      title={wallet.option.prettyName}
      hasBackButton={true}
      onClose={close}
      onBack={onBack}
      closeButtonProps={{
        onClick: async () => {
          await walletManager.disconnect(wallet.option.name)
          close()
        }
      }}
    />
  )
}

export const ConnectingContent = () => {

  const activeWallet = useActiveWallet()
  const { option: { prettyName, mode } } = activeWallet

  let title = 'Requesting Connection';
  let desc: string =
    mode === 'wallet-connect'
      ? `Approve ${prettyName} connection request on your mobile.`
      : `Open the ${prettyName} browser extension to connect your wallet.`;


  if (!activeWallet) return null

  return (
    <ConnectModalStatus
      wallet={{
        name: activeWallet.option.name,
        prettyName: activeWallet.option.prettyName,
        logo: activeWallet.option.logo as string,
        mobileDisabled: true,
      }}
      status='Connecting'
      contentHeader={title}
      contentDesc={desc}
    />
  )
}