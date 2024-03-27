<script setup>
import { store } from "../store";
</script>

<template>
  <div class="wrapper">
    <p>Choose a Ceremony.</p>
    <div class="button-container">
      <button class="open" @click="store.createOpeningCeremony">Opening</button>
      <button class="close" @click="store.createClosingCeremony">
        Closing
      </button>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  text-align: center;

  p {
    font-size: 1.5rem;
  }
}
.button-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
}
button {
  font: inherit;
  font-size: 1.3rem;
  border: solid 1.5px #ffffff;
  border-radius: 30px;
  padding: 0.4em 1.5em;
  color: #ffffff;
  background-color: var(--purple);
  cursor: pointer;
  transition: 0.3s all;
  &:hover {
    background-color: #13489f;
  }
}
</style>
