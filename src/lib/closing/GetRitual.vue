<script setup>
import { ref } from "vue";
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

    queryCDB(session.did.parent);
  }
  if (account.isDisconnected) {
    currentlySignedIn = false;
  }
});

// Retrieves wallet address and reveals signature button
let account = ref("");
async function getWalletInfo(accountAddress) {
  account.value = await new Promise((resolve) => {
    setTimeout(() => {
      resolve(accountAddress);
    }, 10);
  });
}

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

let queryMessageVisible = ref(false);
async function queryCDB(pkh) {
  queryMessageVisible.value = true;
  const response = await compose.executeQuery(
    `query {
  node(id: "${pkh}") {
    ... on CeramicAccount {
      demoShardList(last: 10) {
        edges {
          node {
            ritual {
              name
              date
              participants
              shardbearers
              threshold
              intentions
            }
            shardValue
            signatureDID {
              id
            }
          }
        }
      }
    }
  }
}`
  );
  queryMessageVisible.value = false;
  store.gotRitualList = true;
  ritualListVisible.value = true;
  const sorted = response.data.node.demoShardList.edges.toReversed();
  shards = ref(sorted);
}

let shards;
let ritualListVisible = ref(false);
let promptSignature = ref(false);

async function processSelection(listItem) {
  const shard = shards.value[listItem];
  store.setRitualDetails(shard.node.ritual);
  ritualListVisible.value = false;
  promptSignature.value = true;

  try {
    const signature = await signMessage({
      message: "I bless this offering",
      method: "personal_sign",
    });
    const seed = hash(u8a.fromString(signature.slice(2), "base16"));
    const did = await authenticateDID(seed);
    let encryptedShard = shard.node.shardValue;
    encryptedShard = encryptedShard.replace(/`/g, '"');
    const decryptedShard = await did.decryptDagJWE(JSON.parse(encryptedShard));
    console.log(decryptedShard);
    store.gatherShard(decryptedShard);
    await disconnectAccount();
    promptSignature.value = false;
  } catch (err) {
    console.error(err);
  }
}
</script>

<template>
  <div class="wrapper">
    <p v-if="!store.gotRitualList">Choose a Shardbearer to select a ritual.</p>
    <w3m-button size="md" balance="hide" />
    <p v-if="queryMessageVisible">Retrieving Rituals...</p>
    <div v-if="ritualListVisible" class="ritual-list-container">
      <p>Your Rituals</p>
      <ul class="ritual-list">
        <li v-for="(shard, index) of shards" @click="processSelection(index)">
          <span class="ritual-name"
            ><u>{{ shard.node.ritual.name }}</u></span
          >
          <br />{{ shard.node.ritual.date }} <br />Participants:
          {{ shard.node.ritual.participants }} <br />
          Shardbearers: {{ shard.node.ritual.shardbearers }} <br />
          Threshold:
          {{ shard.node.ritual.threshold }}
        </li>
      </ul>
    </div>
    <p v-if="promptSignature">Use your wallet to retrieve your shard.</p>
  </div>
</template>

<style scoped>
div.wrapper {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;

  p {
    font-size: 1.5rem;
    margin-bottom: 0;
  }
}

ul.ritual-list {
  border: solid 2px #ffffff;
  text-align: left;
  padding-left: 0;
  list-style-type: none;
  min-width: 650px;
  max-height: 400px;
  overflow-y: scroll;
  border-radius: 10px;

  li {
    padding: 1em 0;
    padding-left: 1em;
    background-color: var(--purple);
    width: 100%;
    transition: background-color 0.3s;
    cursor: pointer;
    &:hover {
      background-color: #053c94;
    }
  }

  .ritual-name {
    font-weight: 600;
    font-size: 1.5rem;
  }

  li + li {
    margin-top: 1.4rem;
  }
}
</style>
