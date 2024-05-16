<script setup>
import { ref } from "vue";
import { onMounted } from "vue";
import { store, ceramic, compose } from "../store";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/vue";
import { watchAccount, signMessage, disconnect } from "@wagmi/core";
import { mainnet, arbitrum } from "viem/chains";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import * as u8a from "uint8arrays";
import { hash } from "@stablelib/sha256";
import { getWalletClient } from "@wagmi/core";
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum";
import { DIDSession } from "did-session";

const projectId = "c6c57240c4eee81a0f1fc1b23c905bea";
let signButton;

onMounted(() => {
  signButton = document.querySelector(".sign-button");
});

// TODO: figure out why scanning QR code doesn't work when doing a test with both wallets

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
watchAccount(async (account) => {
  // console.log("account changes:", account);
  if (account.isConnected) {
    const walletClient = await getWalletClient(wagmiConfig);
    const accountId = await getAccountId(
      walletClient,
      walletClient.account.address
    );
    const authMethod = await EthereumWebAuth.getAuthMethod(
      walletClient,
      accountId
    );
    // change to use specific resource
    const session = await DIDSession.get(accountId, authMethod, {
      resources: compose.resources,
    });
    ceramic.did = session.did;
    console.log("Auth'd:", session.did.parent);
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
    }, 10);
  });
  const wuiRouter = shadowRoot.childNodes[2].childNodes[1].childNodes[3];
  const wrapper = wuiRouter.shadowRoot.childNodes[1].childNodes[1].shadowRoot;
  const walletConnectButton = wrapper.childNodes[2].childNodes[5];
  walletConnectButton.click();
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

    const cp = "what will you conjure by the summer solstice?";
    const ep = "feel into the moment and capture its essence.";
    const dp = "what is your biggest dream for the new year?";
    const c = store.intentions.conjurations;
    const e = store.intentions.essence;
    const d = store.intentions.dreams;

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
    const encryptedIntentions = JSON.stringify(jwe).replace(/"/g, "`");
    const updatedRitual = await compose.executeQuery(`
      mutation {
        updateDemoRitual(
          input: {
            id: "${store.streamID}"
            content: {
              name: "${store.ritualName}"
              date: "${store.ritualDate}"
              intentions: "${encryptedIntentions}"
            }
          }
        ) {
          document {
            id
            name
            date
            intentions
          }
        }
      }
    `);

    console.log(updatedRitual);
    await disconnectAccount();
    store.concludeOpeningCeremony();
  } catch (err) {
    console.error(err);
    signButton.innerText = "Signature rejected.";
    setTimeout(() => {
      signButton.innerText = "I bless this offering";
    }, 2000);
  }
}
</script>

<template>
  <h3 v-if="!showAddress">Ritual Leader</h3>
  <div class="wrapper" v-if="!store.concludedOpeningCeremony">
    <div class="modal-container">
      <w3m-button v-if="!showAddress" size="md" balance="hide" />
    </div>
    <p v-if="showAddress">Welcome, Ritual Leader<br />{{ address }}.</p>
    <button
      class="sign-button"
      :class="{ visible: isVisible }"
      @click="executeSignature(account)"
    >
      Encrypt All Intentions
    </button>
  </div>
  <h3 v-else>Ritual Complete.</h3>
</template>

<style scoped>
h3 {
  text-align: center;
  margin-bottom: 3rem;
}
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
