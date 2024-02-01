import store from "../../store/index.js";
import Component from "../../library/component.js";
import GameCanvas from "./game/gameCanvas.js";
import TournamentBracketModal from "./game/tournamentBracketModal.js";
import GameOverModal from "./game/gameOverModal.js";

export default class Tournament extends Component {
	constructor() {
		super({ element: document.getElementById("app") });
		this.render();
		this.components = {
			gameCanvas: new GameCanvas(),
			tournamentBracketModal: new TournamentBracketModal(),
			gameOverModal: new GameOverModal(),
		};
	}

	async render() {
		console.log("render tournament page");

		const view = /*html*/ `
            <div id="game-controls">
                <!-- Canvas for the game -->
                <canvas id="gameCanvas"></canvas>
				<!-- Modal for Game Over -->
                <div id="gameOverModal" class="custom-modal">
                </div>
				<!-- Modal for Tournament Bracket -->
                <div id="tournamentBracketModal" class="custom-modal"></div>
            </div>
        `;

		this.element.innerHTML = view;
		this.handleEvent();
	}
}
