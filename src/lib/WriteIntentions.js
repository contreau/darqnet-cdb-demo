import $ from "./stores";

export class WriteIntentions extends HTMLElement {
  constructor() {
    super();
    const wc = document.createElement("template");
    wc.innerHTML = `
        <div class="wrapper">
            <p>What are your dreams for the new year?</p>
            <input type="text" />
            <button>ᐅ</button>
        </div>

        <style>
        .wrapper {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;

            p {
                font-size: 1.5rem;
                margin-bottom: 0;
            }
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
        </style>
    `;
    const shadow = this.attachShadow({ mode: "open" });
    shadow.append(wc.content.cloneNode(true));
    const input = shadow.querySelector("input");
    const submit = shadow.querySelector("button");
    const question = shadow.querySelector("p");
    let dreams = false;
    let conjurations = false;
    let essence = false;
    setTimeout(() => {
      input.focus();
    }, 500);
    this.finished = new Promise((resolve) => {
      submit.addEventListener("click", () => {
        if (input.value !== "") {
          if (!dreams) {
            $.dreams.push(input.value);
            input.value = "";
            input.focus();
            dreams = true;
            question.innerText =
              "What will you conjure by the summer solstice?";
          } else if (dreams && !conjurations) {
            $.conjurations.push(input.value);
            input.value = "";
            input.focus();
            conjurations = true;
            question.innerText =
              "Feel into the moment and capture its essence.";
          } else if (dreams && conjurations && !essence) {
            $.essence.push(input.value);
            input.value = "";
            essence = true;
            resolve(true);
          }
        }
      });
    });
  }
}
