<script setup>
import { ref } from "vue";
import { onMounted } from "vue";
import { store, compose } from "../store";
import { signMessage, disconnect } from "@wagmi/core";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import * as u8a from "uint8arrays";
import { hash } from "@stablelib/sha256";
import { useW3M } from "../../js/useW3M";

const props = defineProps(["shardIndex"]);

// component state
let address = ref("");
let promptSignature = ref(false);
let awaitingSignature = ref(false);
let hideW3M = ref(false);
const { config } = useW3M(address, executeSignature, props.shardIndex);
onMounted(() => {
  console.log("shard index:", props.shardIndex);
});

async function executeSignature() {
  // change text in button
  promptSignature.value = true;
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

    // if first user, create the ritual on ComposeDB
    if (props.shardIndex === 0) {
      const ritual = await compose.executeQuery(
        `mutation {
        createDemoRitual(
          input: {
            content: {
              name: "${store.ritualName}"
              date: "${store.ritualDate}"
              participants: ${store.participants}
              shardbearers: ${store.shardBearers}
              threshold: ${store.threshold}
              intentions: "{}"
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
      `
      );
      console.log(ritual);
      store.streamID = ritual.data.createDemoRitual.document.id;
      console.log(store.streamID);
    }

    // shard encryption
    const jwe = await did.createDagJWE(store.shards[props.shardIndex], [
      did.id,
    ]);
    const encryptedShard = JSON.stringify(jwe).replace(/"/g, "`");

    // create the user's shard on ComposeDB
    const shardOnDB = await compose.executeQuery(`
      mutation {
        createDemoShard(
          input: {
             content: {
               ritualID: "${store.streamID}"
               shardValue: "${encryptedShard}"
               signatureDID: "${did.id}"
              }
            }
        ) {
          document {
            id
            shardValue
          }
        }
      }
    `);

    console.log(shardOnDB);

    // disconnect wallet and store intentions
    await disconnect(config);
    store.processUser(true);

    // update UI
    promptSignature.value = false;
    awaitingSignature.value = false;
  } catch (err) {
    console.error(err);
    await disconnect(config);
    store.walletRerender = !store.walletRerender;
  }
}
</script>

<template>
  <div class="wrapper">
    <p>You are Shardbearer {{ store.shardBearerLabel }}</p>
    <div v-if="promptSignature" class="prompt-message">
      <p class="address">
        ( <span>{{ address }}</span> )
      </p>
      <p v-if="awaitingSignature">Awaiting signature...</p>
    </div>
    <w3m-button v-if="!hideW3M" size="md" balance="hide" />
  </div>
</template>

<style scoped>
.wrapper {
  text-align: center;

  .shardbearer-label {
    margin-top: 5rem;
    margin-bottom: 2rem;
  }

  .address {
    font-size: 1rem;

    span {
      color: var(--purple);
    }
  }
}
.modal-container {
  display: flex;
  justify-content: center;
}
.sign-button {
  display: block;
  margin: 0 auto;
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
