import $ from "./stores";

export class GetPT extends HTMLElement {
  constructor() {
    super();
    const wc = document.createElement("template");
    wc.innerHTML = `
        <div class="wrapper">
        <p>How many have gathered?</p>
        <input type="number" />
        <button>ᐅ</button>
        </div>
        <style>
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
            input[type=number] {
                -moz-appearance: textfield;
                }
        </style>
    `;
    const shadow = this.attachShadow({ mode: "open" });
    shadow.append(wc.content.cloneNode(true));
    const input = shadow.querySelector("input");
    const submit = shadow.querySelector("button");
    setTimeout(() => {
      input.focus();
    }, 500);
    const questionText = shadow.querySelector("p");
    let gotParticipants = false;
    let gotThreshold = false;
    this.finished = new Promise((resolve) => {
      submit.addEventListener("click", () => {
        if (!gotParticipants) {
          if (input.value !== "" || !isNaN(parseInt(input.value))) {
            $.participants = parseInt(input.value);
            document.querySelector(".p-count").innerText = input.value;
            console.log("participants:", $.participants);
            gotParticipants = true;
            questionText.innerText = "Enter your threshold.";
            input.value = "";
            input.focus();
          }
        } else if (!gotThreshold && gotParticipants) {
          if (input.value !== "" || !isNaN(parseInt(input.value))) {
            $.threshold = parseInt(input.value);
            document.querySelector(".t-count").innerText = input.value;
            console.log("threshold:", $.threshold);
            gotThreshold = true;
            input.value = "";
            resolve(true);
          }
        }
      });
    });
  }
}
