import { useChainWallet } from "@interchain-kit/react";

const UseChainWallet = () => {
  const junoInKeplrWallet = useChainWallet("osmosis", "keplr-extension");
  const stargazeInKeplrWallet = useChainWallet("stargaze", "keplr-extension");
  const junoInLeap = useChainWallet("osmosis", "leap-extension");
  const stargazeInLeap = useChainWallet("stargaze", "leap-extension");
  return (
    <div>
      <table>
        <tbody>
          <tr>
            <td>keplr - juno</td>
            <td>{junoInKeplrWallet.address}</td>
          </tr>
          <tr>
            <td>keplr - stargaze</td>
            <td>{stargazeInKeplrWallet.address}</td>
          </tr>
          <tr>
            <td>leap - juno</td>
            <td>{junoInLeap.address}</td>
          </tr>
          <tr>
            <td>leap - stargaze</td>
            <td>{stargazeInLeap.address}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
export default UseChainWallet;
