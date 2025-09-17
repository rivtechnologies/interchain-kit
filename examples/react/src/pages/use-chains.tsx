import { useChains } from '@interchain-kit/react';

export default function UseChains() {
  const chains = useChains(['Sepolia Testnet', 'solanadevnet']);

  return (
    <div>
      {Object.keys(chains).map((chainName) => (
        <div key={chainName}>
          <h1>{chainName}</h1>
          <p>{chains[chainName].chain.chainName}</p>
          <p>{chains[chainName].chain.chainId}</p>
          <p>{chains[chainName].address}</p>
          <p>{chains[chainName].status}</p>
          <p>{chains[chainName].username}</p>
          <p>{chains[chainName].wallet?.info?.prettyName}</p>
          <button onClick={chains[chainName].connect}>connect</button>
          <button onClick={chains[chainName].disconnect}>disconnect</button>
          <button onClick={chains[chainName].openView}>openView</button>
          <button onClick={chains[chainName].closeView}>closeView</button>
        </div>
      ))}
    </div>
  );
}
