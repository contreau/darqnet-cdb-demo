<script setup>
import { store } from "../store";
import { ref, watch, nextTick } from "vue";

const showSubmitButton = ref(false);
const prompts = ref([""]);
// make this an object in the store, just testing in component for now
function addPrompt() {
  if (prompts.value.length < 3) {
    prompts.value.push("");
    nextTick(() => {
      const lastInput = Array.from(document.querySelectorAll("input")).at(-1);
      lastInput.focus();
    });
  }
}

function removePrompt(index) {
  if (prompts.value.length > 1) {
    prompts.value.splice(index, 1);
    nextTick(() => {
      const lastInput = Array.from(document.querySelectorAll("input")).at(-1);
      lastInput.focus();
    });
  }
}

function validateInputs() {
  const inputs = Array.from(document.querySelectorAll("input"));
  let count = 0;
  for (let input of inputs) {
    if (input.value.trim() === "") {
      showSubmitButton.value = false;
    } else if (input.value.trim() !== "") {
      count++;
    }
  }
  if (count === inputs.length) {
    showSubmitButton.value = true;
  }
}

watch(
  prompts.value,
  () => {
    nextTick(() => {
      validateInputs();
    });
  },
  {
    deep: true,
  }
);
</script>

<template>
  <div class="wrapper">
    <p style="margin-bottom: 0.2rem">Create your prompts. (3 maximum)</p>
    <div class="button-wrapper">
      <button @click="addPrompt" :disabled="prompts.length === 3">+</button>
    </div>
    <div v-for="(item, i) in prompts" class="prompt-item">
      <p>Prompt {{ i + 1 }}</p>
      <div class="input-block">
        <input
          type="text"
          v-model="prompts[i]"
          @keyup="validateInputs"
          autofocus
        />
        <button @click="removePrompt(i)">X</button>
      </div>
    </div>
  </div>
  <button
    class="submit"
    :class="{ hideButton: !showSubmitButton, displayButton: showSubmitButton }"
    @click="store.savePrompts(prompts)"
  >
    ᐅ
  </button>
</template>

<style scoped>
.wrapper {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  p {
    font-size: 1.5rem;
  }
}

.prompt-item {
  width: 100%;

  .input-block {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
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
    font-size: 1.4rem;
    font-weight: 500;
    border-radius: 5px;
    border: none;
    padding: 0em 0.5em 0em 0.5em;
    background-color: #ff5555;
    color: #ffffff;
    cursor: pointer;
    &:hover {
      background-color: #cb4141;
    }
  }
}

.button-wrapper {
  margin: 0 auto;
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;

  button {
    font-size: 1.8rem;
    font-weight: 500;
    border-radius: 5px;
    width: 75px;
    min-height: 40px;
    padding: 0em 0em 0.1em 0em;
    border: none;
    background-color: var(--purple);
    color: #ffffff;
    cursor: pointer;
    &:hover {
      background-color: #2b7cff;
    }
    &:disabled {
      background-color: var(--purple);
      cursor: not-allowed;
    }
  }
}

.submit {
  display: block;
  margin: 0 auto;
  margin-top: 2rem;
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

.hideButton {
  display: none;
}

.displayButton {
  display: block;
}
</style>
