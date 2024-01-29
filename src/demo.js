"use strict";

import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import { SHA256 } from "@stablelib/sha256";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi1";
import { watchAccount, signMessage, disconnect } from "@wagmi/core";
import { mainnet, arbitrum } from "viem/chains";

const projectId = "c6c57240c4eee81a0f1fc1b23c905bea";

// * * * * * * * * * * * * * * * * * *
// WAGMI CONFIG / MODAL INSTANTIATION
// * * * * * * * * * * * * * * * * * *

// Elements to be populated
const signContainer = document.querySelector(".sign--container");
const signButton = document.createElement("button");
signButton.innerText = "I bless this offering";
signButton.classList.add("sign-button");
const jweResult = document.createElement("p");
jweResult.classList.add("jwe-result");
const disconnectionMessage = document.createElement("p");
disconnectionMessage.innerText = "Offering blessed. Wallet Disconnected.";

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

watchAccount((account) => {
  // console.log("account changes:", account);
  if (account.isConnected) {
    currentlySignedIn = true;
    getWalletInfo(account.address);
  }
  if (account.isDisconnected) {
    currentlySignedIn = false;
  }
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

// Retrieves wallet address and creates signature button
async function getWalletInfo(accountAddress) {
  const account = await new Promise((resolve) => {
    setTimeout(() => {
      resolve(accountAddress);
    }, 10);
  });
  signContainer.appendChild(signButton);
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

// * * * * * * * * * *
// MAIN APP EXECUTION
// * * * * * * * * * *

async function executeSignature() {
  // change text in button
  signButton.innerText = "Check your mobile wallet";
  try {
    const signature = await signMessage({
      message: "I bless this offering",
      method: "personal_sign",
    });
    console.log(signature);
    signContainer.removeChild(signButton);
    const hashFn = new SHA256();
    const seed = hashFn.digest(signature);
    const did = await authenticateDID(seed);

    const ceramic = new CeramicClient("https://ceramic-clay.3boxlabs.com");
    ceramic.did = did;
    const doc = await TileDocument.create(
      ceramic,
      null,
      { deterministic: true },
      { anchor: false, publish: false }
    );

    const cp = "What will you conjure by the summer solstice?";
    const ep = "Feel into the moment and capture its essence!";
    const dp = "What is your biggest dream for the new year?";
    const c = ["Conjuration sample.."];
    const e = ["Essence sample.."];
    const d = ["Dream sample.."];

    const jwe = await did.createDagJWE(
      {
        cp,
        ep,
        dp,
        c,
        e,
        d,
      },
      [did.id]
    );
    console.log(JSON.stringify(jwe));
    await doc.update(jwe);
    jweResult.innerText = "Check console for JWE.";
    signContainer.appendChild(disconnectionMessage);
    signContainer.appendChild(jweResult);
    await disconnectAccount();
    // remove signature button and disconnect wallet
    signContainer.removeChild(signButton);
  } catch (err) {
    signButton.innerText = "Signature rejected.";
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 2000);
    });
    signButton.innerText = "I bless this offering";
  }
}
