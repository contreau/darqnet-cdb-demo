<script setup>
import { onMounted, ref } from "vue";
import { store } from "../store";
import * as Bip39 from "bip39";
import * as seedsplit from "../../js/seedsplit";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";

onMounted(() => {
  decryptIntentions();
});

let intentions = null;
let intentionsDecrypted = ref(false);

async function decryptIntentions() {
  try {
    const mainSecret = await seedsplit.combine(store.shards);
    const seed = new Uint8Array(
      Bip39.mnemonicToSeedSync(mainSecret).slice(0, 32)
    );
    const provider = new Ed25519Provider(seed);
    const did = new DID({ provider, resolver: getResolver() });
    await did.authenticate();

    const encryptedIntentions = store.intentions.replace(/`/g, '"');
    const decryptedIntentions = await did.decryptDagJWE(
      JSON.parse(encryptedIntentions)
    );
    intentions = ref(decryptedIntentions);
    intentionsDecrypted.value = true;
  } catch (e) {
    console.error(e);
  }
}
</script>

<template>
  <div class="wrapper" v-if="intentionsDecrypted">
    <h3>Retrieved Intentions:</h3>
    <div v-if="intentions.p1">
      <p>{{ intentions.p1 }}</p>
      <ul>
        <li v-for="(item, index) in intentions.r1">
          Participant {{ index + 1 }}
          <ul>
            <li>{{ item }}</li>
          </ul>
        </li>
      </ul>
    </div>
    <div v-if="intentions.p2">
      <p>{{ intentions.p2 }}</p>
      <ul>
        <li v-for="(item, index) in intentions.r2">
          Participant {{ index + 1 }}
          <ul>
            <li>{{ item }}</li>
          </ul>
        </li>
      </ul>
    </div>
    <div v-if="intentions.p3">
      <p>{{ intentions.p3 }}</p>
      <ul>
        <li v-for="(item, index) in intentions.r3">
          Participant {{ index + 1 }}
          <ul>
            <li>{{ item }}</li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

h3 {
  margin-bottom: 3rem;
}

ul {
  li {
    text-align: left;
  }
}

li > ul {
  margin-bottom: 1.5rem;
}

p {
  font-weight: 600;
  color: var(--purple);
  border-top: solid 2px #ffffff;
  padding-top: 2em;
  margin: 3rem auto;
}
</style>
