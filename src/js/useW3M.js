import { ceramic, compose, store } from "../lib/store";
import { getWalletClient } from "@wagmi/core";
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum";
import { DIDSession } from "did-session";
import { watchAccount, reconnect, http, createConfig } from "@wagmi/core";
import { createWeb3Modal } from "@web3modal/wagmi";
import { walletConnect, coinbaseWallet, injected } from "@wagmi/connectors";
import { mainnet, sepolia } from "@wagmi/core/chains";
const projectId = "c6c57240c4eee81a0f1fc1b23c905bea";

// * * * * * * * * * * * * * * * * * *
// WAGMI CONFIG / MODAL INSTANTIATION
// * * * * * * * * * * * * * * * * * *

export function useW3M(address, callback, shardIndex) {
  const metadata = {
    name: "Darqnet Wallet Demo",
    description: "Darqnet Wallet Demo",
    url: "https://web3modal.com", // don't change this or qr doesn't work
    icons: [""],
  };

  const config = createConfig({
    chains: [mainnet, sepolia],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
    connectors: [
      walletConnect({ projectId, metadata, showQrModal: false }),
      injected({ shimDisconnect: true }),
      coinbaseWallet({
        appName: metadata.name,
        appLogoUrl: metadata.icons[0],
      }),
    ],
  });

  reconnect(config);

  const modal = createWeb3Modal({
    wagmiConfig: config,
    projectId,
    // chains,
    themeVariables: {
      "--w3m-font-family": "system-ui",
      "--w3m-font-size-master": "12px",
      "--w3m-accent": "#1942F9",
    },
  });

  async function showQRCode() {
    const modalParent = document.querySelector("w3m-modal");
    let shadowRoot;
    await new Promise((resolve) => {
      setTimeout(() => {
        shadowRoot = modalParent.shadowRoot;
        resolve(null);
      }, 0);
    });
    const wuiRouter = shadowRoot.childNodes[2].childNodes[1].childNodes[3];
    const wrapper = wuiRouter.shadowRoot.childNodes[1].childNodes[1].shadowRoot;
    const walletConnectButton =
      wrapper.childNodes[2].childNodes[6].shadowRoot.childNodes[2].childNodes[1]
        .shadowRoot.childNodes[2];
    walletConnectButton.click();
  }

  // Modal event subscription
  let currentlySignedIn = false; // toggled boolean to ensure that showQRCode() is only run upon signing in

  modal.subscribeEvents((event) => {
    if (event.data.event === "MODAL_OPEN" && !currentlySignedIn) {
      showQRCode();
    }
  });

  // watches web3 modal for changes
  watchAccount(config, {
    async onChange(account) {
      if (account.isConnected) {
        const walletClient = await getWalletClient(config);
        const accountId = await getAccountId(
          walletClient,
          walletClient.account.address
        );
        const authMethod = await EthereumWebAuth.getAuthMethod(
          walletClient,
          accountId
        );

        // grab accountId and authMethod from first shardbearer for session management
        if (shardIndex === 0) {
          store.firstAccountId = accountId;
          store.firstAccountAuthMethod = authMethod;
        }

        // change to use specific resource
        const session = await DIDSession.get(accountId, authMethod, {
          resources: compose.resources,
        });
        ceramic.did = session.did;
        console.log("Auth'd:", session.did.parent);
        currentlySignedIn = true;
        address.value = account.address;
        callback(session.did.parent);
      }
      if (account.isDisconnected) {
        currentlySignedIn = false;
        // console.log("disconnected");
      }
    },
  });

  return { config };
}
