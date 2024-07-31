import { useAccount, useChain, useActiveWallet, useWalletManager, useWalletModal } from '@interchain-kit/react'
import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react';
import { BaseWallet, ExtensionWallet } from '../../../packages/core/dist';
import { AssetList } from '@chain-registry/v2-types';
import { assetLists } from '@chain-registry/v2';

type BalanceTdProps = {
  assetList: AssetList | undefined
  getStargateClient: () => Promise<any>
  account: any
}

const BalanceTd = ({ assetList, getStargateClient, account }: BalanceTdProps) => {

  if (assetList === undefined) {
    return null
  }


  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState({ denom: '', amount: '' })

  const fetchBalance = async (address: string, denom: string) => {
    const client = await getStargateClient()

    const balance = await client.getBalance(address, denom)

    setBalance(balance)
  }

  const handleChange = async (e: any) => {
    setLoading(true)
    if (account.address === undefined) {
      return
    }

    await fetchBalance(account.address, e.target.value)
    setLoading(false)
  }

  return <td>
    {loading && <span>loading...</span>}
    <select onChange={handleChange}>{assetList.assets.map(a => <option value={a.base}>{a.symbol} - {a.name}</option>)}</select>
    <div>denom: {balance?.denom}</div>
    <div>amount: {balance?.amount}</div>
  </td>
}

function App() {

  const walletManager = useWalletManager()

  const [paringUri, setParingUri] = useState<string>("")
  const [chainName, setChainName] = useState<string>("juno")

  const account = useAccount(chainName)
  const currentWallet = useActiveWallet()
  const { chain, getStargateClient } = useChain(chainName)

  const { open, close } = useWalletModal()



  useEffect(() => {
    console.log({ account })
    if (account === null) {
      open()
    } else {
      close()
    }
  }, [account])





  return (
    <div>
      <select value={chainName} onChange={(e) => {
        setChainName(e.target.value)
      }}>
        {walletManager.chains.map((chain) => {
          return (
            <option key={chain.chainId} value={chain.chainName}>
              {chain.chainName}
            </option>
          )
        })}
      </select>
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
                  walletManager.disconnect()
                }
              }}>
                disconnect {wallet.option?.prettyName}
              </button>
            </td>
            <td>wallet state: {wallet.walletState}</td>
            <td>error message: {wallet.errorMessage}</td>
            {wallet instanceof ExtensionWallet ? <td>extension installed: {JSON.stringify(wallet.isExtensionInstalled)}</td> : <td>xxx</td>}
            <BalanceTd assetList={assetLists.find(a => a.chainName === chainName)} getStargateClient={getStargateClient} account={account} />
          </tr>
        })}</tbody>

      </table>
      {paringUri && <QRCodeSVG size={256} value={paringUri} />}


      <p>current active wallet: {currentWallet?.option?.prettyName}</p>

      <pre>{JSON.stringify(account, null, 2)}</pre>

      <pre>{JSON.stringify(chain, null, 4)}</pre>

    </div>

  )
}

export default App
