<script setup>
import { ref } from "vue";
import { store, compose } from "../store";
import { signMessage, disconnect } from "@wagmi/core";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import * as u8a from "uint8arrays";
import { hash } from "@stablelib/sha256";
import { useW3M } from "../../js/useW3M";

// component state
let address = ref("");
let awaitingSignature = ref(false);
let hideW3M = ref(false);
let promptSignature = ref(true);
const { config } = useW3M(address, getShard, null);

async function getShard(pkh) {
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
  const shards = response.data.node.demoShardList.edges.toReversed();
  let encryptedShard;

  for (let shard of shards) {
    if (shard.node.ritual.id === store.ritualID) {
      encryptedShard = shard.node.shardValue;
      break;
    }
  }

  // update UI
  awaitingSignature.value = true;
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
    encryptedShard = encryptedShard.replace(/`/g, '"');
    // console.log(encryptedShard);
    const decryptedShard = await did.decryptDagJWE(JSON.parse(encryptedShard));
    console.log(decryptedShard);

    // disconnect wallet and store shard
    await disconnect(config);
    store.gatherShard(decryptedShard);

    // update UI
    awaitingSignature.value = false;
  } catch (err) {
    console.error(err);
  }
}
</script>

<template>
  <div class="wrapper">
    <div v-if="promptSignature" class="prompt-message">
      <p>Shardbearer {{ store.shardNumber }}</p>
      <p v-if="!awaitingSignature">Use your wallet to retrieve your shard.</p>
      <p v-if="hideW3M" class="address">
        ( <span>{{ address }}</span> )
      </p>
      <p v-if="awaitingSignature">Awaiting signature...</p>
      <w3m-button v-if="!hideW3M" size="md" balance="hide" />
    </div>
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
    margin-bottom: 2rem;
  }

  .address {
    font-size: 1rem;
    span {
      color: var(--purple);
    }
  }
}
</style>
