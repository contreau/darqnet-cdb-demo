<script setup>
import { onMounted, onBeforeMount } from "vue";
import { store } from "../store";
import { ref, reactive } from "vue";
import WalletLogin from "./WalletLogin.vue";

let gotPrompt1 = ref(false);
let gotPrompt2 = ref(false);
let gotPrompt3 = ref(false);
let response1 = "";
let response2 = "";
let response3 = "";
let input;
let gotLastResponse = ref(false);
let prompts = null;
let tracker = null;

onBeforeMount(() => {
  prompts = store.prompts;
  tracker = new responseTracker(prompts);
  console.log(tracker);
});

onMounted(() => {
  input = document.querySelector("input");
  input.focus();
});

function responseTracker(prompts) {
  return reactive({
    numberOfPrompts: prompts.length,
    promptsAnswered: 0,
    currentPrompt: prompts[0],
    currentPromptIndex: 0,
    incrementAnswers() {
      if (this.currentPromptIndex === 0) {
        store.intentions.prompt1Responses.push(input.value.trim());
      }
      if (this.currentPromptIndex === 1) {
        store.intentions.prompt2Responses.push(input.value.trim());
      }
      if (this.currentPromptIndex === 2) {
        store.intentions.prompt3Responses.push(input.value.trim());
      }
      this.promptsAnswered++;
      if (this.promptsAnswered === this.numberOfPrompts) {
        response3 = input.value;
        input.value = "";
        console.log(store.intentions);
        gotLastResponse.value = true;
        if (!store.chosenShardbearers.includes(props.participantLabel - 1)) {
          store.processUser(false);
        }
      } else {
        input.value = "";
        input.focus();
        this.currentPromptIndex++;
        this.currentPrompt = prompts[this.currentPromptIndex];
      }
    },
  });
}

async function pushIntentions() {
  if (!gotPrompt1.value) {
    response1 = input.value;
    gotPrompt1.value = true;
    input.value = "";
    input.focus();
  } else if (!gotPrompt2.value) {
    response2 = input.value;
    gotPrompt2.value = true;
    input.value = "";
    input.focus();
  } else if (gotPrompt1.value && gotPrompt2.value) {
    response3 = input.value;
    input.value = "";
    gotPrompt3.value = true;
    store.saveIntentions(response1, response2, response3);
    if (!store.chosenShardbearers.includes(props.participantLabel - 1)) {
      store.processUser(false);
    }
  }
}

const props = defineProps(["participantLabel", "shardIndex"]);
</script>

<template>
  <h3>Participant {{ props.participantLabel }}</h3>
  <div class="wrapper" v-if="!gotLastResponse">
    <p>{{ tracker.currentPrompt }}</p>
    <input type="text" />
    <button @click="tracker.incrementAnswers()">ᐅ</button>
  </div>
  <WalletLogin
    v-if="
      gotLastResponse &&
      store.chosenShardbearers.includes(props.participantLabel - 1)
    "
    :shardIndex="props.shardIndex"
    :key="store.walletRerender"
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
