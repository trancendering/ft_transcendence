import store from "../../../store/index.js";
import Component from "../../../library/component.js";
import { opponentWaitingModal } from "../../utils/languagePack.js";

export default class OpponentWaitingModal extends Component {
	constructor(params) {
		super({
			store,
			element: document.getElementById("opponentWaitingModal"),
		});
		this.render();

		store.events.subscribe("gameStatusChange", async () =>
			this.hideOpponentWaitingModal()
		);
	}

	async render() {
		console.log("render opponent waiting modal");
		const languageId = store.state.languageId;

		const view = /*html*/`
            <div class="modal-dialog modal-dialog-centered modal-sm" role="document">
			<div class="modal-content">
                    <div class="modal-body text-center p-lg-4">
                        <!-- Loading Spinner Wrapper-->
                        <div class="loader text-center mt-3">
                            <!-- Animated Spinner -->
                            <div class="lds-roller mb-3">
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                        </div>
                        <h4 class="text-center mt-3">${opponentWaitingModal[languageId].waiting} 1 / 2</h4>
                        <p class="mt-3">${opponentWaitingModal[languageId].description}</p>
                        <button id="cancelMatchBtn" type="button" class="btn btn-sm mt-3 btn-secondary" data-bs-dismiss="modal">${opponentWaitingModal[languageId].cancel}</button>
                    </div>
                </div>
				</div>
		`;

		this.element = document.getElementById("opponentWaitingModal");
		this.element.innerHTML = view;
		this.handleEvent();
	}

	async handleEvent() {
		document
			.getElementById("cancelMatchBtn")
			.addEventListener("click", async (event) => {
				console.log("cancel match making");

				// Prevent Default Link Behavior
				event.preventDefault();

				// Reset Fancy Ball State
				store.dispatch("setFancyBall", { fancyBall: "normal" });

				// Cancel Match Making Post Request
				// TODO 소켓 Connection 끊는 로직
			});
	}

	async hideOpponentWaitingModal() {
		if (store.state.gameStatus !== "playing") return;
		console.log("hide Opponent Waiting Modal");
		document
			.querySelectorAll(".modal-backdrop")
			.forEach((elem) => elem.remove());
	}
}
