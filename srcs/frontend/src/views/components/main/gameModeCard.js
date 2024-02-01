import store from "../../../store/index.js";
import Component from "../../../library/component.js";
import { gameModeCard } from "../../utils/languagePack.js";
// import ModalHandler from "../utils/modalHandler.js";
import Single from "../../../static/img/singleGameMode.svg";
import Tournament from "../../../static/img/tournamentGameMode.svg";

const gameModeSvgPaths = {
	Single: Single,
	Tournament: Tournament,
};

export default class GameModeCard extends Component {
	constructor(params) {
		super({ element: document.getElementById(params.id) });
		this.id = params.id;
		this.gameMode = params.gameMode;
		this.description = params.description;
		this.render();
	}

	async render() {
		const languageId = store.state.languageId;

		const view = /*html*/ `
            <div class="d-flex flex-column align-items-center justify-content-center p-3 m-3">
                <img class="mb-3" width="60" height="60" src="${
					gameModeSvgPaths[this.gameMode]
				}" alt="${this.id}">
                <h3 class="text-2xl fw-bold mb-1">${
					gameModeCard[languageId][this.gameMode]
				}</h3>
                <button class="btn btn-primary mt-4 inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-800/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50">
                	${gameModeCard[languageId].play}
                </button>
            </div>
        `;

		this.element = document.getElementById(this.id);
		this.element.innerHTML = view;
		this.handleEvent();
	}

	async handleEvent() {
		this.element.querySelector("button").addEventListener("click", () => {
			document.getElementById("gameCustomizationModal").style.display =
				"flex";
			store.dispatch("setGameMode", { gameMode: this.gameMode });
		});
	}
}
