import { assetLists, chains } from "@chain-registry/v2";
import {
  BaseWallet,
  EthereumWallet,
  isInstanceOf,
  MultiChainWallet,
  WCWallet,
} from "@interchain-kit/core";
import {
  useChainWallet,
  useWalletManager,
  useWalletModal,
} from "@interchain-kit/react";
import { useRef, useState } from "react";
import { makeKeplrChainInfo } from "../utils";
import { Chain, Asset } from "@chain-registry/v2-types";
import { coins } from "@cosmjs/amino";
import { ChainInfo } from "@keplr-wallet/types";
import { createGetBalance } from "interchainjs/cosmos/bank/v1beta1/query.rpc.func";
import QRCode from "react-qr-code";
import { createSend } from "interchainjs/cosmos/bank/v1beta1/tx.rpc.func";
import { ethers } from "ethers";

type BalanceProps = {
  address: string;
  wallet: BaseWallet;
  chainName: string;
  chainId: string;
  chain: Chain;
};

const BalanceTd = ({ address, wallet, chain }: BalanceProps) => {
  const { rpcEndpoint } = useChainWallet(
    chain.chainName,
    wallet.info?.name as string
  );

  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<any>();

  const handleBalanceQuery = async () => {
    let balance;

    setIsLoading(true);

    if (isInstanceOf(wallet, WCWallet)) {
      if (chain.chainType === "eip155") {
        // await wallet.personalSign("test", address);

        const provider = wallet.getProvider();
        const ethersProvider = new ethers.BrowserProvider(provider);
        const result = await ethersProvider.getBalance(address, "latest");
        const balanceInWei = result;
        balance = { balance: { amount: balanceInWei.toString() } };
      }
      if (chain.chainType === "cosmos") {
        const balanceQuery = createGetBalance(rpcEndpoint as string);
        balance = await balanceQuery({
          address,
          denom: chain.staking?.stakingTokens[0].denom as string,
        });
      }
    }

    if (isInstanceOf(wallet, EthereumWallet)) {
      const provider = new ethers.BrowserProvider(wallet.getProvider());
      const result = await provider.getBalance(address);
      balance = { balance: { amount: result.toString() } };
    }

    if (isInstanceOf(wallet, MultiChainWallet)) {
      if (chain.chainType === "eip155") {
        const ethWallet = wallet.getWalletByChainType("eip155");
        if (isInstanceOf(ethWallet, EthereumWallet)) {
          const provider = new ethers.BrowserProvider(ethWallet.getProvider());
          const result = await provider.getBalance(address);
          balance = { balance: { amount: result.toString() } };
        }
      }

      if (chain.chainType === "cosmos") {
        const balanceQuery = createGetBalance(rpcEndpoint as string);
        balance = await balanceQuery({
          address,
          denom: chain.staking?.stakingTokens[0].denom as string,
        });
      }
    }

    setBalance(balance);
    setIsLoading(false);
  };

  return (
    <td>
      <div>
        <button className="bg-blue-100 p-1 m-1" onClick={handleBalanceQuery}>
          refresh balance
        </button>
      </div>
      <div>
        <span>balance: </span>
        <span>{balance?.balance?.amount}</span>
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
  const toAddressRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  const { getSigningClient } = useChainWallet(
    chain.chainName,
    wallet.info?.name as string
  );

  const handleSendToken = async () => {
    if (!toAddressRef.current || !amountRef.current) {
      return;
    }

    const transaction = {
      from: address,
      to: toAddressRef.current.value,
      value: `0x${parseInt(amountRef.current.value).toString(16)}`,
      // data: "0x",
    };

    if (isInstanceOf(wallet, WCWallet)) {
      if (chain.chainType === "eip155") {
        const provider = new ethers.BrowserProvider(wallet.getProvider());
        // const provider = new ethers.JsonRpcProvider(
        //   "https://endpoints.omniatech.io/v1/eth/sepolia/public"
        // );

        const signer = await provider.getSigner();

        try {
          console.log(transaction);

          const txResponse = await signer.sendTransaction(transaction);

          const txReceipt = await txResponse.wait();
          console.log("Transaction hash:", txReceipt?.hash);
          console.log(txResponse);
        } catch (error) {
          console.log(error);
        }
      }
      if (chain.chainType === "cosmos") {
        const signingClient = await getSigningClient();
        const txSend = createSend(signingClient);
        const recipientAddress = toAddressRef.current.value;
        const denom = chain.staking?.stakingTokens[0].denom as string;

        const fee = {
          amount: coins(25000, denom),
          gas: "1000000",
        };

        try {
          const tx = await txSend(
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
    }

    if (isInstanceOf(wallet, EthereumWallet)) {
      const provider = new ethers.BrowserProvider(wallet.getProvider());
      const signer = await provider.getSigner();
      try {
        console.log(transaction);
        await wallet.switchChain(chain.chainId as string);
        const tx = await signer.sendTransaction(transaction);
        console.log(tx);
      } catch (error) {
        console.log(error);
      }
    }

    if (isInstanceOf(wallet, MultiChainWallet)) {
      if (chain.chainType === "eip155") {
        const ethWallet = wallet.getWalletByChainType("eip155");
        if (isInstanceOf(ethWallet, EthereumWallet)) {
          console.log(ethWallet);
          const provider = new ethers.BrowserProvider(ethWallet.getProvider());
          const signer = await provider.getSigner();
          try {
            // await ethWallet.switchChain(chain.chainId as string);
            const tx = await signer.sendTransaction(transaction);
            console.log(tx);
          } catch (error) {
            console.log(error);
          }
        }
      }

      if (chain.chainType === "cosmos") {
        const signingClient = await getSigningClient();
        const txSend = createSend(signingClient);
        const recipientAddress = toAddressRef.current.value;
        const denom = chain.staking?.stakingTokens[0].denom as string;

        const fee = {
          amount: coins(25000, denom),
          gas: "1000000",
        };

        try {
          const tx = await txSend(
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
    }
  };

  return (
    <td>
      <div>
        <button className="bg-blue-100 p-1 m-1" onClick={handleSendToken}>
          Send Token to:
        </button>
        <input
          className="border-red-300 border-2 rounded-sm"
          ref={toAddressRef}
        />
      </div>
      <div>
        amount:{" "}
        <input className="border-red-300 border-2 rounded-sm" ref={amountRef} />
      </div>
    </td>
  );
};

const RpcTd = ({ wallet, address, chain }: SendTokenProps) => {
  const { rpcEndpoint, getRpcEndpoint } = useChainWallet(
    chain.chainName,
    wallet.info?.name as string
  );

  return (
    <td>
      <p>{rpcEndpoint as string}</p>
      <button onClick={getRpcEndpoint}>get rpc</button>
    </td>
  );
};

const AddressTd = ({ wallet, chain }: SendTokenProps) => {
  const { address, wallet: walletHandler } = useChainWallet(
    chain.chainName,
    wallet.info?.name as string
  );
  return (
    <td>
      <p>{address}</p>
      <button onClick={() => walletHandler.getAccount(chain.chainId as string)}>
        get account
      </button>
    </td>
  );
};

const ChainRow = ({ chain, wallet }: { chain: Chain; wallet: BaseWallet }) => {
  const { address, rpcEndpoint, connect, disconnect, status } = useChainWallet(
    chain.chainName,
    wallet.info?.name as string
  );
  return (
    <tr>
      <td>
        <button onClick={connect}>connect by chain</button>
        <button onClick={disconnect}>disconnect by chain</button>
      </td>
      <td>{chain.chainName}</td>
      <td>{chain.chainId}</td>
      <td>{status}</td>
      <RpcTd address={address} wallet={wallet} chain={chain}></RpcTd>
      <AddressTd address={address} wallet={wallet} chain={chain}></AddressTd>
      <BalanceTd
        address={address}
        chainId={chain.chainId as string}
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
    (w: BaseWallet) => w.info?.name === wallet.info?.name
  );

  const connect = () => {
    walletManager.connect(wallet.info?.name as string, "osmosis");
  };

  const disconnect = () => {
    walletManager.disconnect(wallet.info?.name as string, "osmosis");
  };

  const uri = walletManager.walletConnectQRCodeUri;

  return (
    <td>
      <button className="bg-blue-100 p-1 m-1" onClick={connect}>
        connect
      </button>
      <button className="bg-blue-100 p-1 m-1" onClick={disconnect}>
        disconnect
      </button>
      {currentWallet instanceof WCWallet && uri && <QRCode value={uri} />}
      {wallet.errorMessage}
    </td>
  );
};

const E2ETest = () => {
  const walletManager = useWalletManager();
  const { open } = useWalletModal();
  const addChain = async () => {
    const keplrExtension = walletManager.wallets.find(
      (w) => w.info?.name === "keplr-extension"
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
              <tr key={wallet.info?.name}>
                <td>{wallet.info?.name}</td>
                <td>{wallet.info?.prettyName}</td>
                <WalletConnectTd wallet={wallet} />
                <td>{wallet.walletState}</td>
                <td>
                  <table>
                    <thead>
                      <tr>
                        <th>connect</th>
                        <th>name</th>
                        <th>chainId</th>
                        <th>state</th>
                        <th>rpc</th>
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
      <button className="bg-blue-100 p-1 m-1" onClick={addChain}>
        add suggest chain
      </button>
      <button className="bg-blue-100 p-1 m-1" onClick={open}>
        open modal
      </button>
    </div>
  );
};

export default E2ETest;
