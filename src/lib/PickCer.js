export class PickCer extends HTMLElement {
  constructor() {
    super();
    const wc = document.createElement("template");
    wc.innerHTML = `
        <div class="wrapper">
            <p>Choose a Ceremony.</p>
            <div class="button-container">
                <button class="open">Opening</button>
                <button class="close">Closing</button>
            </div>
        </div>

        <style>
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
    `;
    const shadow = this.attachShadow({ mode: "open" });
    shadow.append(wc.content.cloneNode(true));
    const openBtn = shadow.querySelector(".open");
    const closeBtn = shadow.querySelector(".close");
    this.result = new Promise((resolve) => {
      openBtn.addEventListener("click", () => {
        resolve("opening");
      });
      closeBtn.addEventListener("click", () => {
        resolve("closing");
      });
    });
  }
}
