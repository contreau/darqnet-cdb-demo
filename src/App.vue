<script setup>
import { ref } from "vue";
import { store } from "./lib/store";
import Header from "../src/lib/Header.vue";
import ChooseCeremony from "./lib/opening/ChooseCeremony.vue";
import NameDate from "./lib/opening/NameDate.vue";
import GetPT from "./lib/opening/GetPT.vue";
import WriteIntentions from "./lib/opening/WriteIntentions.vue";
import PushToComposeDB from "./lib/opening/PushToComposeDB.vue";
</script>

<template>
  <Header />
  <ChooseCeremony v-if="!store.ceremonyChosen" />
  <!-- OPENING CEREMONY -->
  <NameDate v-if="store.ceremonyChosen && !store.acquiredNameDate" />
  <GetPT v-if="store.acquiredNameDate && !store.acquiredPT" />
  <WriteIntentions
    :participantLabel="store.participantLabel"
    :key="store.rerender"
    v-if="store.acquiredPT && !store.acquiredIntentions"
  />
  <PushToComposeDB v-if="store.acquiredIntentions" />
</template>

<style>
:root {
  --purple: #1760d6;
}

html,
body {
  padding: 0;
  margin: 0;
}
*,
*::before,
*::after {
  box-sizing: border-box;
}
body {
  background-color: #0a1027;
  color: #ffffff;
  font-family: system-ui;
  padding: 0 5em;
  font-size: 1.125rem;
}

w3m-button {
  margin: 0 auto;
}

.sign-container {
  text-align: center;
}

.jwe-result {
  text-align: center;
  opacity: 0;
  animation: fadeIn 0.6s ease-in forwards;
}

@keyframes fadeIn {
  100% {
    opacity: 1;
  }
}

.entries-display {
  display: flex;
  gap: 5rem;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
}

.entry {
  h3,
  p {
    text-align: center;
  }
  p {
    background-color: #1760d6;
    border-radius: 15px;
    padding: 0.5em;
  }
}

.seedsplit-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4rem;

  h3 {
    margin-top: 0;
    span {
      color: #02a2fe;
    }
  }
}

.participant-label {
  font-size: 1.8rem;
  text-align: center;
  opacity: 0;
  transition: opacity 0.3s;
}
</style>
