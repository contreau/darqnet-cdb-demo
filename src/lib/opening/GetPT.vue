<script setup>
import { store } from "../store";
import { ref } from "vue";
import { onMounted } from "vue";

let input;
let gotParticipants = ref(false);
let gotThreshold = ref(false);

onMounted(() => {
  input = document.querySelector("input");
  input.focus();
});

function processPT() {
  if (!gotParticipants.value) {
    if (!isNaN(parseInt(input.value))) {
      store.participants = parseInt(input.value);
      gotParticipants.value = true;
      input.value = "";
      input.focus();
    }
  } else if (gotParticipants.value && !gotThreshold.value) {
    if (
      !isNaN(parseInt(input.value)) &&
      parseInt(input.value) <= store.participants
    ) {
      store.threshold = parseInt(input.value);
      input.value = "";
      store.splitMainSecret();
    }
  }
}
</script>

<template>
  <div class="wrapper">
    <p v-if="!gotParticipants">How many have gathered?</p>
    <p v-else>What is your threshold?</p>
    <input type="number" />
    <button @click="processPT">ᐅ</button>
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
}

input {
  max-width: 200px;
  border: solid 1.5px #ffffff;
  border-radius: 15px;
  font-size: 1.5rem;
  text-align: center;
  &:focus-visible {
    outline: none;
  }
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
