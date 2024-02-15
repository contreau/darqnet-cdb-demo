"use strict";

// Ceramic Node
const CERAMIC_NODE = "https://ceramic-blessclub.hirenodes.io/";

// global state
import $ from "./lib/stores";

// components
import { NameDate } from "./lib/NameDate";
import { GetPT } from "./lib/GetPT";
import { PickCer } from "./lib/PickCer";
import { WalletLogin } from "./lib/WalletLogin";
import { WriteIntentions } from "./lib/WriteIntentions";

// encryption
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import * as Bip39 from "bip39";
import * as seedsplit from "./js/seedsplit";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { TileDocument } from "@ceramicnetwork/stream-tile";

// Component Container
const componentContainer = document.querySelector(".component-container");

// register web components
customElements.define("name-date", NameDate);
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
    const ND = new NameDate();
    $.replaceComponent(PC, ND);
    await ND.finished;
    ptTracker.style.opacity = "1";
    const PT = new GetPT();
    $.replaceComponent(ND, PT);
    await openingCeremony(PT);
  } else if (ceremony === "closing") {
    await closingCeremony();
  }
}

async function openingCeremony(PT) {
  console.log("opening ceremony chosen");
  // generate main secret + create ritual DID
  const mainSecret = Bip39.generateMnemonic();
  const seed = new Uint8Array(
    Bip39.mnemonicToSeedSync(mainSecret).slice(0, 32)
  );
  const provider = new Ed25519Provider(seed);
  const ritualDID = new DID({ provider, resolver: getResolver() });
  await ritualDID.authenticate();
  $.ritualDID = ritualDID.id;
  document.querySelector(".ritual-did").innerText = $.ritualDID;
  console.log(
    "Ritual | Name:",
    $.ritualName,
    "| Date:",
    $.ritualDate,
    "|",
    $.ritualDID
  );

  // get participant count & threshold
  await PT.finished;

  // split main secret
  const shards = await seedsplit.split(mainSecret, $.participants, $.threshold);
  $.shards = shards;
  console.log($.shards);

  // gather intentions from each participant
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
}

async function closingCeremony() {
  console.log("closing ceremony chosen");
}

main();
