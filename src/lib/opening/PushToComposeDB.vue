<script setup>
import { onMounted, ref } from "vue";
import { store, ceramic, compose } from "../store";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { DIDSession } from "did-session";

onMounted(() => {
  checkForActiveSession();
});

let hasError = ref(false);

async function checkForActiveSession() {
  if (await DIDSession.hasSessionFor(store.firstAccountId, compose.resources)) {
    console.log(`There is an active session for ${store.firstAccountId}`);
    // change to use specific resource
    const session = await DIDSession.get(
      store.firstAccountId,
      store.firstAccountAuthMethod,
      {
        resources: compose.resources,
      }
    );
    ceramic.did = session.did;
    executeSignature();
  } else {
    console.error("No active session.");
    hasError.value = true;
  }
}

async function executeSignature() {
  try {
    const provider = new Ed25519Provider(store.firstAccountSeed);
    const did = new DID({ provider, resolver: getResolver() });
    await did.authenticate();

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
      store.signatureDIDs
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
              participants: ${store.participants}
              shardbearers: ${store.shardBearers}
              threshold: ${store.threshold}
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
    store.concludeOpeningCeremony();
  } catch (err) {
    hasError.value = true;
    console.error(err);
  }
}
</script>

<template>
  <h3 v-if="!hasError">Intentions Encrypted.<br />Ritual Complete.</h3>
  <h3 v-else>Error Encrypting Intentions.<br />Check console for details.</h3>
</template>

<style scoped>
h3 {
  text-align: center;
}
</style>
