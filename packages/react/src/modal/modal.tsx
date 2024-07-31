import { useWalletManager } from "../hooks"

const style: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%,-50%)',
  width: '500px',
  backgroundColor: 'white',
}

export const WalletModal = () => {
  const walletManager = useWalletManager()
  return (
    <ul style={style}>
      {walletManager.wallets.map(wallet => {
        return (
          <li>
            <span>{wallet.option.prettyName}</span>
            <button onClick={() => walletManager.connect(wallet.option.name)}>connect</button>
          </li>
        )
      })}
    </ul>
  )
}