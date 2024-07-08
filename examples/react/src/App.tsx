import { useAccount, useWalletManager } from '@interchain-kit/react'
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react';
import { BaseWallet, ExtensionWallet } from '../../../packages/core/dist';
function App() {

  const walletManager = useWalletManager()
  const account = useAccount()

  const [paringUri, setParingUri] = useState<string>("")

  return (
    <div>
      <table border={1}>
        <tbody>{walletManager.wallets.map((wallet: BaseWallet) => {
          return <tr>
            <td>
              <button onClick={() => {
                if (wallet.option?.name) {
                  walletManager.connect(wallet.option?.name, () => setParingUri(''), setParingUri)
                }
              }}>
                connect {wallet.option?.prettyName}
              </button>
            </td>
            <td>
              <button onClick={() => {
                if (wallet.option?.name) {
                  walletManager.disconnect(wallet.option?.name)
                }
              }}>
                disconnect {wallet.option?.prettyName}
              </button>
            </td>
            <td>wallet state: {wallet.walletState}</td>
            <td>error message: {wallet.errorMessage}</td>
            {wallet instanceof ExtensionWallet && <td>extension installed: {JSON.stringify(wallet.isExtensionInstalled)}</td>}
          </tr>
        })}</tbody>

      </table>
      {paringUri && <QRCodeSVG size={256} value={paringUri} />}


      <p>current active wallet: {walletManager.getActiveWallet()?.option?.prettyName}</p>

      <pre>{JSON.stringify(account, null, 2)}</pre>

    </div>

  )
}

export default App
