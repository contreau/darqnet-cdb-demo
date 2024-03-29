<script setup>
import { ref } from "vue";
import { onMounted } from "vue";
import { store } from "../store";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/vue";
import { watchAccount, signMessage, disconnect } from "@wagmi/core";
import { mainnet, arbitrum } from "viem/chains";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import * as u8a from "uint8arrays";
import { hash } from "@stablelib/sha256";

const projectId = "c6c57240c4eee81a0f1fc1b23c905bea";
let signButton;

onMounted(() => {
  signButton = document.querySelector(".sign-button");
});

const props = defineProps(["shardIndex"]);

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
  wagmiConfig,
  projectId,
  chains,
  themeVariables: {
    "--w3m-font-family": "system-ui",
    "--w3m-font-size-master": "12px",
    "--w3m-accent": "#1942F9",
  },
});

// Modal event subscription
let currentlySignedIn = false; // toggled boolean to ensure that showQRCode() is only run upon signing in

modal.subscribeEvents((event) => {
  if (event.data.event === "MODAL_OPEN" && !currentlySignedIn) {
    showQRCode();
  }
  // console.log(event);
});

// watches web3 modal for changes
let showAddress = ref(false);
let address = ref("");
watchAccount((account) => {
  // console.log("account changes:", account);
  if (account.isConnected) {
    currentlySignedIn = true;
    getWalletInfo(account.address);
    address.value = account.address;
    showAddress.value = true;
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

async function executeSignature() {
  // change text in button
  signButton.innerText = "Check your mobile wallet";
  try {
    const signature = await signMessage({
      message: "I bless this offering",
      method: "personal_sign",
    });
    const seed = hash(u8a.fromString(signature.slice(2), "base16"));
    const did = await authenticateDID(seed);
    console.log(did.id);

    // test encryption ✅
    const jwe = await did.createDagJWE(store.shards[props.shardIndex], [
      did.id,
    ]);
    const encryptedShard = JSON.stringify(jwe);

    // test decryption ✅
    const decryptedShard = await did.decryptDagJWE(JSON.parse(encryptedShard));
    console.log("decrypted:", decryptedShard);

    await disconnectAccount();
    store.processWallet();
  } catch (err) {
    console.error(err);
    signButton.innerText = "Signature rejected.";
    setTimeout(() => {
      signButton.innerText = "I bless this offering";
    }, 2000);
  }
}

// Retrieves wallet address and reveals signature button
let account = ref("");
let isVisible = ref(false);
async function getWalletInfo(accountAddress) {
  account.value = await new Promise((resolve) => {
    setTimeout(() => {
      resolve(accountAddress);
    }, 10);
  });
  isVisible.value = true;
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
</script>

<template>
  <div class="wrapper">
    <div class="modal-container">
      <w3m-button v-if="!showAddress" size="md" balance="hide" />
    </div>
    <p v-if="showAddress">Welcome, {{ address }}.</p>
  </div>
  <div class="sign-container">
    <button
      class="sign-button"
      :class="{ visible: isVisible }"
      @click="executeSignature(account)"
    >
      I bless this offering
    </button>
  </div>
</template>

<style scoped>
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
  opacity: 0;
  transition: 0.3s all;
  &:hover {
    background-color: #02714c;
  }
}
.visible {
  opacity: 1;
}
</style>
