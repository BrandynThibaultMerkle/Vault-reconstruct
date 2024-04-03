import Web3Modal, { connectors } from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

export const createWeb3Modal = (t) =>
  new Web3Modal({
    network: "mainnet",
    cacheProvider: true,
    theme: "dark",
    providerOptions: {
      injected: {
        display: {
          name: "Metamask",
          description: "Metamask",
        },
      },
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          rpc: {
            1: "https://eth-mainnet.alchemyapi.io/v2/NMfny0oE8hAQ5tueVKfzX8tpqAIUPeM3",
          },
        },
      },
    },
  });
