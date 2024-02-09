"use strict";

// global state
import $ from "./lib/stores";

// components
import { GetPT } from "./lib/GetPT";
import { PickCer } from "./lib/PickCer";
import { WalletLogin } from "./lib/WalletLogin";
import { WriteIntentions } from "./lib/WriteIntentions";

// encryption
import * as Bip39 from "bip39";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { TileDocument } from "@ceramicnetwork/stream-tile";

// Component Container
const componentContainer = document.querySelector(".component-container");

// register web components
customElements.define("get-pt", GetPT);
customElements.define("pick-cer", PickCer);
customElements.define("wallet-login", WalletLogin);
customElements.define("write-intentions", WriteIntentions);
const PC = document.querySelector("pick-cer");
const ptTracker = document.querySelector(".PT-tracker");
const participantLabel = document.querySelector(".participant-label");

// * * * * * * * * * *
// MAIN APP EXECUTION
// * * * * * * * * * *

async function main() {
  const ceremony = await PC.result;
  if (ceremony === "opening") {
    ptTracker.style.opacity = "1";
    const PT = new GetPT();
    $.replaceComponent(PC, PT);
    await openingCeremony(PT);
  } else if (ceremony === "closing") {
    await closingCeremony();
  }
}

async function openingCeremony(PT) {
  console.log("opening ceremony chosen");
  await PT.finished;
  for (let i = 0; i < $.participants; i++) {
    const WI = new WriteIntentions();
    $.replaceComponent(componentContainer.childNodes[1], WI);
    participantLabel.innerText = `Participant ${i + 1}`;
    participantLabel.style.opacity = "1";
    await WI.finished;
    console.log("intentions:", {
      dreams: $.dreams,
      conjurations: $.conjurations,
      essence: $.essence,
    });
    const WL = new WalletLogin();
    $.replaceComponent(WI, WL);
    await WL.finished;
  }
  const mnemonic = Bip39.generateMnemonic();
  console.log(mnemonic);
}

async function closingCeremony() {
  console.log("closing ceremony chosen");
}

main();
