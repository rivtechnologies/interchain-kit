import { assetLists, chains } from "@chain-registry/v2";
import { BaseWallet, WalletState, WCWallet } from "@interchain-kit/core";
import {
  useChainWallet,
  useConfig,
  useWalletManager,
} from "@interchain-kit/react";
import { useEffect, useRef, useState } from "react";
import { creditFromStarship, makeKeplrChainInfo } from "../utils";
import { Chain, Asset } from "@chain-registry/v2-types";
import { coins } from "@cosmjs/amino";
import { ChainInfo } from "@keplr-wallet/types";
import QRCode from "react-qr-code";

type BalanceProps = {
  address: string;
  wallet: BaseWallet;
  chainName: string;
  chainId: string;
  chain: Chain;
};

const BalanceTd = ({ address, wallet, chain }: BalanceProps) => {
  const [balance, setBalance] = useState<string | undefined>("");
  const { queryClient, isLoading } = useChainWallet(
    chain.chainName,
    wallet.option?.name as string
  );

  useEffect(() => {
    if (
      address &&
      wallet &&
      chain &&
      wallet.walletState === "Connected" &&
      !isLoading
    ) {
      getBalance();
    }
  }, [address, wallet, chain, isLoading]);

  const getBalance = async () => {
    try {
      const { balance } = await queryClient.balance({
        address,
        denom: chain.staking?.stakingTokens[0].denom as string,
      });
      setBalance(balance?.amount);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFaucet = async () => {
    await creditFromStarship(
      "http://localhost:8003/credit",
      address,
      chain.staking?.stakingTokens[0].denom as string
    );
    await getBalance();
  };

  if (isLoading) {
    return <td>loading...</td>;
  }

  return (
    <td>
      <div>
        <button onClick={handleFaucet}>faucet from starship</button>
      </div>
      <div>
        <button onClick={getBalance}>refresh balance</button>
      </div>
      <div>
        <span>balance: </span>
        <span>{balance}</span>
      </div>
    </td>
  );
};

type SendTokenProps = {
  wallet: BaseWallet;
  address: string;
  chain: Chain;
};
const SendTokenTd = ({ wallet, address, chain }: SendTokenProps) => {
  const { signingCosmosClient, signingCosmWasmClient } = useChainWallet(
    chain.chainName,
    wallet.option?.name as string
  );

  const ref = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  const handleSendToken = async () => {
    if (ref.current) {
      const recipientAddress = ref.current.value;
      const denom = chain.staking?.stakingTokens[0].denom as string;

      const fee = {
        amount: coins(25000, denom),
        gas: "1000000",
      };

      try {
        const tx = await signingCosmosClient.helpers.send(
          address,
          {
            fromAddress: address,
            toAddress: recipientAddress,
            amount: [
              { denom: denom, amount: amountRef.current?.value as string },
            ],
          },
          fee,
          "test"
        );
        console.log(tx);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <td>
      <div>
        <button onClick={handleSendToken}>Send Token to:</button>
        <input ref={ref} />
      </div>
      <div>
        amount: <input ref={amountRef} />
      </div>
    </td>
  );
};

const ChainRow = ({ chain, wallet }: { chain: Chain; wallet: BaseWallet }) => {
  const { address } = useChainWallet(
    chain.chainName,
    wallet.option?.name as string
  );
  return (
    <tr>
      <td>{chain.chainName}</td>
      <td>{chain.chainId}</td>
      <td>{address}</td>
      <BalanceTd
        address={address}
        chainId={chain.chainId}
        chainName={chain.chainName}
        wallet={wallet}
        chain={chain}
      />
      <SendTokenTd address={address} wallet={wallet} chain={chain} />
    </tr>
  );
};

const WalletConnectTd = ({ wallet }: { wallet: BaseWallet }) => {
  const walletManager = useWalletManager();

  const chainIds = walletManager.chains.map((c) => c.chainId);

  const currentWallet = walletManager.wallets.find(
    (w: BaseWallet) => w.option?.name === wallet.option?.name
  );

  const connect = () => {
    walletManager.connect(wallet.option?.name as string);
  };

  const disconnect = () => {
    walletManager.disconnect(wallet.option?.name as string);
  };

  const uri = (currentWallet as WCWallet).pairingUri || "";

  return (
    <td>
      <button onClick={connect}>connect</button>
      <button onClick={disconnect}>disconnect</button>
      {currentWallet instanceof WCWallet && uri && <QRCode value={uri} />}
      {wallet.errorMessage}
    </td>
  );
};

const E2ETest = () => {
  const walletManager = useWalletManager();

  const addChain = async () => {
    const keplrExtension = walletManager.wallets.find(
      (w) => w.option?.name === "keplr-extension"
    );

    const chain = chains.find((c) => c.chainName === "cosmoshub");
    const assetList = assetLists.find((a) => a.chainName === "cosmoshub");

    const chainInfo: ChainInfo = makeKeplrChainInfo(
      chain as Chain,
      assetList?.assets[0] as Asset,
      "http://localhost:26653",
      "http://localhost:1313",
      "test-cosmoshub-4",
      "cosmoshub"
    );

    keplrExtension?.addSuggestChain(chainInfo);
  };

  return (
    <div>
      <table style={{ width: "1000px" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Pretty Name</th>
            <th>Connect</th>
            <th>State</th>
            <th>Chain</th>
          </tr>
        </thead>
        <tbody>
          {walletManager.wallets.map((wallet) => {
            return (
              <tr key={wallet.option?.name}>
                <td>{wallet.option?.name}</td>
                <td>{wallet.option?.prettyName}</td>
                <WalletConnectTd wallet={wallet} />
                <td>{wallet.walletState}</td>
                <td>
                  <table>
                    <thead>
                      <tr>
                        <th>name</th>
                        <th>chainId</th>
                        <th>address</th>
                        <th>faucet</th>
                        <th>send token</th>
                      </tr>
                    </thead>
                    <tbody>
                      {walletManager.chains.map((chain) => {
                        return (
                          <ChainRow
                            chain={chain}
                            wallet={wallet}
                            key={chain.chainId}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button onClick={addChain}>add suggest chain</button>
    </div>
  );
};

export default E2ETest;
