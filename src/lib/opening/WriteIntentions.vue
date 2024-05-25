<script setup>
import { onMounted } from "vue";
import { store } from "../store";
import { ref } from "vue";
import WalletLogin from "./WalletLogin.vue";

let gotDreams = ref(false);
let gotConjurations = ref(false);
let gotEssence = ref(false);
let dreams = "";
let conjurations = "";
let essence = "";
let input;

onMounted(() => {
  input = document.querySelector("input");
  input.focus();
});

async function pushIntentions() {
  if (!gotDreams.value) {
    dreams = input.value;
    gotDreams.value = true;
    input.value = "";
    input.focus();
  } else if (!gotConjurations.value) {
    conjurations = input.value;
    gotConjurations.value = true;
    input.value = "";
    input.focus();
  } else if (gotDreams.value && gotConjurations.value) {
    essence = input.value;
    input.value = "";
    gotEssence.value = true;
    store.saveIntentions(dreams, conjurations, essence);
    if (!store.chosenShardbearers.includes(props.participantLabel - 1)) {
      store.processUser(false);
    }
  }
}

const props = defineProps(["participantLabel", "shardIndex"]);
</script>

<template>
  <h3>Participant {{ props.participantLabel }}</h3>
  <div class="wrapper" v-if="!gotEssence">
    <p>
      <span v-if="!gotDreams">What are your dreams for the new year?</span>
      <span v-else-if="!gotConjurations"
        >What will you conjure by the summer solstice?</span
      >
      <span v-else>Feel into the moment and capture its essence.</span>
    </p>

    <input type="text" />
    <button @click="pushIntentions">ᐅ</button>
  </div>
  <WalletLogin
    v-if="
      gotEssence &&
      store.chosenShardbearers.includes(props.participantLabel - 1)
    "
    :shardIndex="props.shardIndex"
  />
</template>

<style scoped>
h3 {
  text-align: center;
}
.wrapper {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  p {
    font-size: 1.5rem;
    margin-bottom: 0;
  }
}
input {
  width: 100%;
  max-width: 600px;
  min-height: 30px;
  border: solid 1.5px #ffffff;
  border-radius: 15px;
  font-size: 1.1rem;
  text-align: center;
  &:focus-visible {
    outline: none;
  }
}
button {
  display: block;
  margin: 0 auto;
  border: solid 1.5px #ffffff;
  border-radius: 50%;
  padding: 0.2em 0.5em;
  font-size: 1.4rem;
  color: #ffffff;
  background-color: var(--purple);
  cursor: pointer;
  transition: 0.3s all;
  &:hover {
    background-color: #13489f;
  }
}
</style>
