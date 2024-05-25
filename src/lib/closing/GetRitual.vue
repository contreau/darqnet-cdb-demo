<script setup>
import { ref } from "vue";
import { store, compose } from "../store";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import * as u8a from "uint8arrays";
import { hash } from "@stablelib/sha256";
import { signMessage, disconnect } from "@wagmi/core";
import { useW3M } from "../../js/useW3M";

// component state
let address = ref("");
let queryMessageVisible = ref(false);
let shards;
let ritualListVisible = ref(false);
let promptSignature = ref(false);
let hideW3M = ref(false);
const { config } = useW3M(address, queryCDB, null);

async function queryCDB(pkh) {
  queryMessageVisible.value = true;
  const response = await compose.executeQuery(
    `query {
  node(id: "${pkh}") {
    ... on CeramicAccount {
      demoShardList(last: 1000) {
        edges {
          node {
            ritual {
              id
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

async function processSelection(listItem) {
  const shard = shards.value[listItem];
  store.setRitualDetails(shard.node.ritual);
  ritualListVisible.value = false;
  promptSignature.value = true;
  hideW3M.value = true;

  try {
    const signature = await signMessage(config, {
      message: "I bless this offering",
      method: "personal_sign",
    });

    // create key DID from signature hash
    const seed = hash(u8a.fromString(signature.slice(2), "base16"));
    const provider = new Ed25519Provider(seed);
    const did = new DID({ provider, resolver: getResolver() });
    await did.authenticate();
    let encryptedShard = shard.node.shardValue;
    encryptedShard = encryptedShard.replace(/`/g, '"');
    const decryptedShard = await did.decryptDagJWE(JSON.parse(encryptedShard));
    console.log(decryptedShard);

    // disconnect wallet and store shard
    await disconnect(config);
    store.gatherShard(decryptedShard);

    // update UI
    promptSignature.value = false;
  } catch (err) {
    console.error(err);
  }
}
</script>

<template>
  <div class="wrapper">
    <p v-if="!store.gotRitualList">Choose a Shardbearer to select a ritual.</p>
    <w3m-button v-if="!hideW3M" size="md" balance="hide" />
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

    <div v-if="promptSignature" class="prompt-message">
      <p>Shardbearer {{ store.shardNumber }}</p>
      <p class="address">
        ( <span>{{ address }}</span> )
      </p>
      <p>Awaiting Signature...</p>
    </div>
  </div>
</template>

<!-- TODO: handle canceling of signature to reset the login button / go back to previous step - this would handle someone deciding to no longer be a shardbearer even after it prompted them to sign -->

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

  .address {
    font-size: 1rem;
    span {
      color: var(--purple);
    }
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
