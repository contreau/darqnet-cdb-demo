<script setup>
import { store } from "./store";
</script>

<template>
  <header>
    <img
      src="../../public/dnet-orb--300.png"
      alt="Purple Orb"
      width="50"
      height="50"
    />
    <h1>Darqnet + WalletConnect Demo</h1>
  </header>
  <div class="PT-tracker">
    <p>
      Ritual: <span class="ritual-name">{{ store.ritualName }}</span> |
      <span class="ritual-date">{{ store.ritualDate }}</span>
    </p>
    <p>
      Participants: <span class="p-count">{{ store.participants }}</span>
    </p>
    <p>
      Shardbearers: <span class="sh-count">{{ store.shardBearers }}</span>
    </p>
    <p>
      Threshold: <span class="t-count">{{ store.threshold }}</span>
    </p>
  </div>
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: solid 0.5px #ffffff3b;
}

.PT-tracker {
  display: flex;
  gap: 1rem;

  span {
    color: #02a2fe;
    font-weight: 500;
  }
}
</style>
