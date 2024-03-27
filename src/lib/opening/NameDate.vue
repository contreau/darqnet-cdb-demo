<script setup>
import { onMounted } from "vue";
import { store } from "../store";
let input;

function saveNameDate() {
  if (input.value !== "") {
    const name = input.value.trim();
    const date = new Date().toISOString();
    store.setNameDate(name, date);
  }
}

onMounted(() => {
  input = document.querySelector("input");
  input.focus();
});
</script>

<template>
  <div class="wrapper">
    <p>Name this ritual.</p>
    <input type="text" />
    <button @click="saveNameDate">ᐅ</button>
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
    margin: 0 auto;
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
  width: 100%;
  max-width: 500px;
  border: solid 1.5px #ffffff;
  border-radius: 15px;
  font-size: 1.5rem;
  text-align: center;
  &:focus-visible {
    outline: none;
  }
}
</style>
