import store from "../../../store/index.js";
import Component from "../../../library/component.js";
import { gameOverModal } from "../../utils/languagePack.js";
import CrownImg from "../../../static/img/crown.svg";
import FrownImg from "../../../static/img/frown.svg";

export default class GameOverModal extends Component {
	constructor() {
		super({
			store,
			element: document.getElementById("gameOverModal"),
		});
		this.render();
		store.events.subscribe("gameStatusChange", async () =>
			this.showModal()
		);
	}

	async render() {
		console.log("render game over modal");

		const languageId = store.state.languageId;
		const imgSrc = store.state.endReason === "normal" ? CrownImg : FrownImg;
		const textContent =
			store.state.endReason === "normal"
				? `${gameOverModal[languageId].normalEnd} ${store.state.winner}!`
				: `${gameOverModal[languageId].abnormalEnd}!`;

		const view = /*html*/ `
			<div class="custom-modal-dialog">
				<div class="custom-modal-content">
					<div class="p-5">
						<h2 class="mb-0">${gameOverModal[languageId].gameOver}</h2>
						<img class="mb-3 mt-3" width="48" height="48" src=${imgSrc} alt="gameOverModal">
						<h5 class="mb-0">${textContent}</h5>
						<a id="closeModalBtn" data-link href="/" rol="button" type="button" class="btn btn-lg btn-primary mt-5 w-100">
							${gameOverModal[languageId].closeButton}
						</a>
					</div>
				</div>
			</div>
		`;

		this.element = document.getElementById("gameOverModal");
		this.element.innerHTML = view;
		this.handleEvent();
	}

	async handleEvent() {
		document
			.getElementById("closeModalBtn")
			.addEventListener("click", () => {
				document.getElementById("gameOverModal").style.display = "none";
			});
	}

	async showModal() {
		console.log(`showModal() - gameStatus: ${store.state.gameStatus}`);
		if (store.state.gameStatus !== "ended") return;
		if (store.state.endReason === "userLeft") return;

		this.render();
		document.getElementById("gameOverModal").style.display = "flex";
	}
}
