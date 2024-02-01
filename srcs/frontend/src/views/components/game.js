import store from "../../store/index.js";
import Component from "../../library/component.js";
import GameCanvas from "./game/gameCanvas.js";
import GameOverModal from './game/gameOverModal.js';

export default class Game extends Component {
	constructor(params) {
		super({
			store,
			element: document.getElementById("app"),
		});
		this.render();
		this.components = {
			gameCanvas: new GameCanvas(),
			gameOverModal: new GameOverModal(),
		};

	}

	async render() {
		const view = /*html*/ `
            <div id="game-controls">
                <!-- Canvas for the game -->
                <canvas id="gameCanvas"></canvas>
				<!-- Modal for Game Over -->
                <div id="gameOverModal" class="custom-modal">
                </div>
            </div>
        `;

		this.element.innerHTML = view;
	}
}
