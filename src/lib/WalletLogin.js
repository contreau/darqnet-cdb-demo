import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi1";
import { watchAccount, signMessage, disconnect } from "@wagmi/core";
import { mainnet, arbitrum } from "viem/chains";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { SHA256 } from "@stablelib/sha256";

const projectId = "c6c57240c4eee81a0f1fc1b23c905bea";

// * * * * * * * * * * * * * * * * * *
// WAGMI CONFIG / MODAL INSTANTIATION
// * * * * * * * * * * * * * * * * * *

const metadata = {
  name: "Darqnet Wallet Demo",
  description: "Darqnet Wallet Demo",
  url: "https://web3modal.com", // don't change this or qr doesn't work
  icons: [""],
};

const chains = [mainnet, arbitrum];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

const modal = createWeb3Modal({
  themeVariables: {
    "--w3m-font-family": "system-ui",
    "--w3m-font-size-master": "12px",
    "--w3m-accent": "#1942F9",
  },
  showQrModal: true,
  wagmiConfig,
  projectId,
  chains,
});

// Modal event subscription
let currentlySignedIn = false; // toggled boolean to ensure that showQRCode() is only run upon signing in

modal.subscribeEvents((event) => {
  if (event.data.event === "MODAL_OPEN" && !currentlySignedIn) {
    showQRCode();
  }
  // console.log(event);
});

// * * * * * * * * *
// HELPER FUNCTIONS
// * * * * * * * * *

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
  const walletConnectButton = wrapper.childNodes[2].childNodes[5];
  walletConnectButton.click();
}

// * * * * * * * * * * * *
// WalletLogin COMPONENT
// * * * * * * * * * * * *

export class WalletLogin extends HTMLElement {
  constructor() {
    super();
    const wc = document.createElement("template");
    wc.innerHTML = `
        <div class="wrapper">
            <div class="modal-container">
                <w3m-button size="md" balance="hide"></w3m-button>
            </div> 
        </div>
        <div class="sign-container">
            <button class="sign-button">I bless this offering</button>
        </div>

        <style>
            .wrapper {
                text-align: center;
            }
            .modal-container {
                display: flex;
                justify-content: center;
            }
            .sign-button {
                display: block;
                margin: 2rem auto;
                font: inherit;
                padding: 0.5em 1em;
                border-radius: 30px;
                border: none;
                color: #ffffff;
                background-color: #019765;
                cursor: pointer;
                transition: 0.3s all;
                opacity: 0;
                animation: fadeIn 0.6s ease-in forwards;
                &:hover {
                  background-color: #02714c;
                }
              }
        </style>
    `;
    const shadow = this.attachShadow({ mode: "open" });
    shadow.append(wc.content.cloneNode(true));

    const signButton = shadow.querySelector(".sign-button");
    // watches web3 modal for changes
    watchAccount((account) => {
      console.log("account changes:", account);
      if (account.isConnected) {
        currentlySignedIn = true;
        getWalletInfo(account.address);
      }
      if (account.isDisconnected) {
        currentlySignedIn = false;
      }
    });

    // Retrieves wallet address and creates signature button
    async function getWalletInfo(accountAddress) {
      const account = await new Promise((resolve) => {
        setTimeout(() => {
          resolve(accountAddress);
        }, 10);
      });
      signButton.style.opacity = "1";
      signButton.addEventListener("click", () => executeSignature(account));
    }

    // Create DID from hash
    async function authenticateDID(seed) {
      const provider = new Ed25519Provider(seed);
      const did = new DID({ provider, resolver: getResolver() });
      await did.authenticate();
      return did;
    }
    // Disconnects wallet account - wagmi method doesn't work by itself in the try/catch block
    async function disconnectAccount() {
      await disconnect();
    }

    async function executeSignature() {
      // change text in button
      signButton.innerText = "Check your mobile wallet";
      try {
        const signature = await signMessage({
          message: "I bless this offering",
          method: "personal_sign",
        });
        const hashFn = new SHA256();
        const seed = hashFn.digest(signature);
        const did = await authenticateDID(seed);
        console.log(did.id);

        // const ceramic = new CeramicClient("https://ceramic-clay.3boxlabs.com");
        // ceramic.did = did;
        // const doc = await TileDocument.create(
        //   ceramic,
        //   null,
        //   { deterministic: true },
        //   { anchor: false, publish: false }
        // );

        // const cp = "What will you conjure by the summer solstice?";
        // const ep = "Feel into the moment and capture its essence!";
        // const dp = "What is your biggest dream for the new year?";
        // const c = ["Conjuration sample.."];
        // const e = ["Essence sample.."];
        // const d = ["Dream sample.."];

        // const jwe = await did.createDagJWE(
        //   {
        //     cp,
        //     ep,
        //     dp,
        //     c,
        //     e,
        //     d,
        //   },
        //   [did.id]
        // );
        // console.log(JSON.stringify(jwe));
        // await doc.update(jwe);

        await disconnectAccount();
      } catch (err) {
        console.error(err);
        signButton.innerText = "Signature rejected.";
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(null);
          }, 2000);
        });
        signButton.innerText = "I bless this offering";
      }
    }

    this.finished = new Promise((resolve) => {});
  }
}
