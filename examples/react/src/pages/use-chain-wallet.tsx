import { useChainWallet } from "@interchain-kit/react";

const UseChainWallet = () => {
  const junoInKeplrWallet = useChainWallet("juno", "keplr-extension");
  const stargazeInKeplrWallet = useChainWallet("stargaze", "keplr-extension");
  const junoInLeap = useChainWallet("juno", "leap-extension");
  const stargazeInLeap = useChainWallet("stargaze", "leap-extension");
  return (
    <div>
      <table>
        <tbody>
          <tr>
            <td>keplr - juno</td>
            <td>{junoInKeplrWallet.address}</td>
            <td>
              <button
                className="bg-green-300 px-1"
                onClick={junoInKeplrWallet.connect}
              >
                connect
              </button>
            </td>
            <td>
              <button
                className="bg-red-300 px-1"
                onClick={junoInKeplrWallet.disconnect}
              >
                disconnect
              </button>
            </td>
          </tr>
          <tr>
            <td>keplr - stargaze</td>
            <td>{stargazeInKeplrWallet.address}</td>
            <td>
              <button
                className="bg-green-300 px-1"
                onClick={stargazeInKeplrWallet.connect}
              >
                connect
              </button>
            </td>
            <td>
              <button
                className="bg-red-300 px-1"
                onClick={stargazeInKeplrWallet.disconnect}
              >
                disconnect
              </button>
            </td>
          </tr>
          <tr>
            <td>leap - juno</td>
            <td>{junoInLeap.address}</td>
            <td>
              <button
                className="bg-green-300 px-1"
                onClick={junoInLeap.connect}
              >
                connect
              </button>
            </td>
            <td>
              <button
                className="bg-red-300 px-1"
                onClick={junoInLeap.disconnect}
              >
                disconnect
              </button>
            </td>
          </tr>
          <tr>
            <td>leap - stargaze</td>
            <td>{stargazeInLeap.address}</td>
            <td>
              <button
                className="bg-green-300 px-1"
                onClick={stargazeInLeap.connect}
              >
                connect
              </button>
            </td>
            <td>
              <button
                className="bg-red-300 px-1"
                onClick={stargazeInLeap.disconnect}
              >
                disconnect
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
export default UseChainWallet;
