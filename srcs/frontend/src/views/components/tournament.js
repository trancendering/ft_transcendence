import store from "../../store/index.js";
import Component from "../../library/component.js";
import GameCanvas from "./game/gameCanvas.js";
import TournamentBracketModal from "./game/tournamentBracketModal.js";
import { navigateTo } from "../utils/router.js";

export default class Tournament extends Component {
	constructor(params) {
		super({
			store,
			element: document.getElementById("app"),
		});
		this.render();
		this.components = {
			gameCanvas: new GameCanvas(),
			tournamentBracketModal: new TournamentBracketModal(),
		};

		store.events.subscribe("gameStatusChange", async () =>
			this.showGameOverModal()
		);
	}

	async render() {
		console.log("render tournament page");

		const view = /*html*/`
            <div id="game-controls">
                <!-- Canvas for the game -->
                <canvas id="gameCanvas" width="800" height="400"></canvas>

				<!-- Modal for Game Over -->
                <div id="gameOverModal" style="display: none;">
                    <p id="gameOverText"></p>
                    <button id="closeModalButton">Close</button>
                </div>
                <div id="tournamentBracketModal" class="modal fade" tabindex="-1" aria-labelledby="tournamentBracketModalLabel">
                </div>
            </div>
        `;

		this.element.innerHTML = view;
		this.handleEvent();
	}

	async handleEvent() {
		document
			.getElementById("closeModalButton")
			.addEventListener("click", () => {
				document.getElementById("gameOverModal").style.display = "none";
				navigateTo("/");
			});
	}

	async showGameOverModal() {
		if (store.state.gameStatus !== "ended" || store.state.round != 3)
			return;

		document.getElementById("gameOverModal").style.display = "block";

		console.log("game over: ", store.state.endReason, store.state.winner);
		if (store.state.endReason === "normal") {
			document.getElementById("gameOverText").textContent = `
            Game Over! Winner is ${store.state.winner}!`;
		} else {
			document.getElementById("gameOverText").textContent = `
            Game Over! Someone left the game!`;
		}
	}
}
