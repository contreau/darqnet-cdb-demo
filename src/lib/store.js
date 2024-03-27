import { reactive } from "vue";
import * as Bip39 from "bip39";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import KeyResolver from "key-did-resolver";
import * as seedsplit from "../js/seedsplit";

export const store = reactive({
  // ceremony details
  ceremonyType: "",
  ceremonyChosen: false,
  ritualName: "?",
  ritualDate: "?",
  acquiredNameDate: false,
  createOpeningCeremony() {
    this.ceremonyChosen = true;
    console.log("Opening Ceremony chosen.");
    this.ceremonyType = "open";
    this.ceremonyChosen = true;
    this.mainSecret = Bip39.generateMnemonic();
  },
  setNameDate(name, date) {
    this.ritualName = name;
    this.ritualDate = date;
    this.acquiredNameDate = true;
    console.log("Ritual | Name:", this.ritualName, "| Date:", this.ritualDate);
  },
  createClosingCeremony() {
    this.ceremonyChosen = true;
    console.log("Closing Ceremony chosen.");
    this.ceremonyType = "close";
  },

  // participant and threshold
  participants: 0,
  participantLabel: 1,
  threshold: 0,
  acquiredPT: false,
  shards: null,
  async splitMainSecret() {
    this.shards = await seedsplit.split(
      this.mainSecret,
      this.participants,
      this.threshold
    );
    console.log("shards:", this.shards);
    this.acquiredPT = true;
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

  processWallet() {
    if (this.participantLabel < this.participants) {
      this.participantLabel++;
      this.rerender = !this.rerender; // trigger rerender of component
    } else if (this.participantLabel === this.participants) {
      this.acquiredIntentions = true;
      console.log(this.intentions);
    }
  },
});
