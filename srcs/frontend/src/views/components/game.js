import Component from "../../library/component.js";
import GameCanvas from "./game/gameCanvas.js";
import BackgroundMusic from "./game/backgroundMusic.js";
import AudioButton from "./game/audioButton.js";
import TournamentBracketModal from "./game/tournamentBracketModal.js";
import GameOverModal from "./game/gameOverModal.js";

export default class Game extends Component {
	constructor() {
		super({ element: document.getElementById("app") });
		this.render();
		this.components = {
			gameCanvas: new GameCanvas(),
			backgroundMusic: new BackgroundMusic(),
			audioButton: new AudioButton(),
			tournamentBracketModal: new TournamentBracketModal(),
			gameOverModal: new GameOverModal(),
		};
	}

	async render() {
		const view = /*html*/ `
			<!-- Background Music -->
			<audio id="bgm" loop></audio>

			<!-- Audio Button -->
			<div id="audioBtn"></div>

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
	}
}
