import { reactive } from "vue";
import * as Bip39 from "bip39";
import * as seedsplit from "../js/seedsplit";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { ComposeClient } from "@composedb/client";
import { definition } from "../../definition";

export const ceramic = new CeramicClient("http://localhost:7007");
export const compose = new ComposeClient({ ceramic, definition });
console.log(compose.resources);

export const store = reactive({
  // ceremony details
  streamID: "",
  ceremonyType: "",
  ceremonyChosen: false,
  ritualName: "?",
  ritualDate: "?",
  acquiredNameDate: false,
  concludedOpeningCeremony: false,
  ritualKey: null,
  walletRerender: false,

  // session
  firstAccountId: null,
  firstAccountAuthMethod: null,

  async createOpeningCeremony() {
    this.ceremonyChosen = true;
    console.log("Opening Ceremony chosen.");
    this.ceremonyType = "open";
    this.ceremonyChosen = true;
    this.mainSecret = Bip39.generateMnemonic();
    const seed = new Uint8Array(
      Bip39.mnemonicToSeedSync(this.mainSecret).slice(0, 32)
    );
    const provider = new Ed25519Provider(seed);
    this.ritualKey = new DID({ provider, resolver: getResolver() });
    await this.ritualKey.authenticate();
    console.log(this.ritualKey.id);
  },
  setNameDate(name, date) {
    this.ritualName = name;
    this.ritualDate = date;
    this.acquiredNameDate = true;
    console.log("Ritual | Name:", this.ritualName, "| Date:", this.ritualDate);
  },

  // participants, shardbearers, threshold
  participants: 0,
  participantLabel: 1,
  shardBearers: 0,
  shardBearerLabel: 1,
  chosenShardbearers: null,
  shardIndex: 0,
  threshold: 0,
  acquiredPT: false,
  shards: null,

  async splitMainSecret() {
    this.shards = await seedsplit.split(
      this.mainSecret,
      this.shardBearers,
      this.threshold
    );
    console.log(
      "participants:",
      this.participants,
      "shardBearers:",
      this.shardBearers,
      "threshold:",
      this.threshold
    );
    console.log("shards:", this.shards);
    this.determineShardbearers();
    this.acquiredPT = true;
  },

  determineShardbearers() {
    const chosenShardbearers = [];
    const set = new Set();
    while (set.size < this.shardBearers) {
      const rando = Math.floor(Math.random() * this.participants);
      if (!set.has(rando)) {
        set.add(rando);
        chosenShardbearers.push(rando);
      }
    }
    chosenShardbearers.sort((a, b) => a > b);
    this.chosenShardbearers = chosenShardbearers;
    console.log("chosen shardbearers:", this.chosenShardbearers);
  },

  // intentions submission
  acquiredIntentions: false,
  rerender: false,
  intentions: {
    dreams: [],
    conjurations: [],
    essence: [],
  },

  async saveIntentions(d, c, e) {
    this.intentions.dreams.push(d);
    this.intentions.conjurations.push(c);
    this.intentions.essence.push(e);
    console.log(this.intentions);
  },

  async processUser(incrementShardbearerLabel) {
    if (this.participantLabel < this.participants) {
      this.participantLabel++;
      if (incrementShardbearerLabel) {
        this.shardBearerLabel++;
        this.shardIndex++;
        this.rerender = !this.rerender; // trigger rerender of component
      } else {
        this.rerender = !this.rerender; // trigger rerender of component
      }
    } else if (this.participantLabel === this.participants) {
      this.acquiredIntentions = true;
      console.log(this.intentions);
    }
  },

  concludeOpeningCeremony() {
    this.concludedOpeningCeremony = true;
  },

  // CLOSING CEREMONY
  // MARK: CC
  ritualID: null,
  gotRitualList: false,
  ritualSelected: false,
  collectingShards: false,
  acquiredClosingShards: false,
  decryptionError: false,
  decryptionVisible: false,
  shardNumber: 1,

  createClosingCeremony() {
    this.ceremonyChosen = true;
    console.log("Closing Ceremony chosen.");
    this.ceremonyType = "close";
  },

  setRitualDetails(ritual) {
    this.ritualID = ritual.id;
    this.ritualName = ritual.name;
    this.ritualDate = ritual.date;
    this.participants = ritual.participants;
    this.threshold = ritual.threshold;
    this.shardBearers = ritual.shardbearers;
    this.intentions = ritual.intentions;
  },

  gatherShard(shard) {
    if (this.shards === null) {
      this.shards = [];
      setTimeout(() => {
        this.ritualSelected = true;
      }, 100);
    }
    if (this.shardNumber < this.threshold) {
      this.shards.push(shard);
      console.log("collected shards:", this.shards);
      this.shardNumber++;
      this.rerender = !this.rerender;
    } else if (this.shardNumber === this.threshold) {
      this.shards.push(shard);
      console.log("collected shards:", this.shards);
      this.acquiredClosingShards = true;
    }
  },
});
