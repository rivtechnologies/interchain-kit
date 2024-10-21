import { useEffect, useState } from 'react'
import { useChain } from '@interchain-kit/react'
import { HttpEndpoint } from "@cosmjs/stargate"

const UseChain = () => {
  const [chainName, setChainName] = useState("osmosis");
  const [rpcEndpoint, setRpcEndpoint] = useState<HttpEndpoint | string>('')
  const { logoUrl, address, status, username, wallet, openView, getRpcEndpoint, disconnect } = useChain(chainName);

  useEffect(() => {
    if (getRpcEndpoint) {
      getRpcEndpoint().then(endpoint => {
        setRpcEndpoint(endpoint)
      })
    }
  }, [getRpcEndpoint])

  useEffect(() => {
    if (logoUrl) {
      console.log(logoUrl)
    }
  }, [logoUrl])

  const clickDisconnect = () => {
    disconnect()
  }

  return (
    <div className="space-y-4 mx-auto max-w-3xl mt-20">
      <h1 className="text-2xl font-semibold">useChain usage:</h1>
      <select
        value={chainName}
        onChange={(e) => setChainName(e.target.value)}
        className="h-9 px-3 mr-4 border rounded-md shadow-sm"
      >
        <option value="juno">Juno</option>
        <option value="osmosis">Osmosis</option>
        <option value="stargaze">Stargaze</option>
        <option value="cosmoshub">Cosmos Hub</option>
      </select>
      <div className="flex items-center">
        <span className="font-bold">logo:</span> <img className="w-[20px] h-[20px]" src={logoUrl} alt="logoUrl" />
      </div>
      <div>
        <span className="font-bold">rpcEndpoint: {rpcEndpoint}</span>
      </div>
      <div>
        <span className="font-bold">current wallet: </span>{wallet?.option?.prettyName}
      </div>
      <div>
        <span className="font-bold">wallet status: </span>
        {status === 'Connected' ? <span className="text-green-900">Connected</span> : status}
        {status === 'Connected' ? (
          <span className="text-red-600 underline cursor-pointer ml-5" onClick={clickDisconnect}>disconnect</span>
        ) : (
          <>
            <span className="text-red-600">Disconnected</span>
            <span className="text-blue-600 underline cursor-pointer ml-5" onClick={openView}>connect</span>
          </>
        )
        }
      </div>
      <div>
        <span className="font-bold">username: </span>{username}
      </div>
      <div className="flex items-center">
        <span className="font-bold">account address: </span>{address}
      </div>
    </div>
  )
}
export default UseChain