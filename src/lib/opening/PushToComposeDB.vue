<script setup>
import { onMounted, ref } from "vue";
import { store, ceramic, compose } from "../store";
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
    const cleartext = {};
    const temp = [];
    for (let response in store.intentions) {
      temp.push(store.intentions[response]);
    }
    for (let i = 0; i < temp.length; i++) {
      cleartext[`p${i + 1}`] = store.prompts[i];
      cleartext[`r${i + 1}`] = temp[i];
    }

    const jwe = await store.ritualKey.createDagJWE(cleartext, [
      store.ritualKey.id,
    ]);
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
