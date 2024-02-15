import $ from "./stores";

export class NameDate extends HTMLElement {
  constructor() {
    super();
    const wc = document.createElement("template");
    wc.innerHTML = `
        <div class="wrapper">
            <p>Name this ritual.</p>
            <input type="text" />
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
    `;
    const shadow = this.attachShadow({ mode: "open" });
    shadow.append(wc.content.cloneNode(true));
    const submit = shadow.querySelector("button");
    const input = shadow.querySelector("input");
    setTimeout(() => {
      input.focus();
    }, 500);
    this.finished = new Promise((resolve) => {
      submit.addEventListener("click", () => {
        if (input.value !== "") {
          $.ritualName = input.value;
          $.ritualDate = new Date().toISOString();
          document.querySelector(".ritual-name").innerText = $.ritualName;
          resolve(true);
        }
      });
    });
  }
}
