import store from "../../../store/index.js";
import Component from "../../../library/component.js";
import { gameCustomizationModal } from "../../utils/languagePack.js";

export default class GameCustomizationModal extends Component {
	constructor(params) {
		super({
			store,
			element: document.getElementById("game-customization-modal"),
		});
	}

	async render() {
		const languageId = store.state.languageId;

		const view = `
                    <div class="modal-dialog modal- modal-m modal-dialog-centered" role="document">
                        <div class="modal-content">
                            <div class="modal-body text-center p-lg-4">

			                <form id="game-customization-form">

                                <h3 class="text-dark mt-3">${gameCustomizationModal[languageId].setting}</h3>
								<div class="row justify-content-center">
									<div class="form-group col-md-6 col-lg-10">
										<label for="nickname" class="col-form-label mt-4">${gameCustomizationModal[languageId].nickname}</label>
										<input type="text" class="form-control mt-2" id="nickname" required>
									</div>
								</div>

								<!-- speed Option -->
								<div class="btn-group d-flex justify-content-center" role="group" id="speed-option">
									<div class="form-group mt-4">
										<label for="speed" class="col-form-label">${gameCustomizationModal[languageId].speed}</label>
										<div class="btn-group d-flex justify-content-center mt-2" role="group" aria-label="speed-option">
											<input type="radio" name="speed-btn" class="btn-check" id="normal-speed" checked value="normal">
											<label class="btn btn-outline-primary me-2" for="normal-speed">${gameCustomizationModal[languageId].normalSpeed}</label>
											<input type="radio" name="speed-btn" class="btn-check" id="fast-speed" value="fast">
											<label class="btn btn-outline-primary" for="fast-speed">${gameCustomizationModal[languageId].fastSpeed}</label>
										</div>
									</div>
								</div>

								<!-- ballDesign Option -->
								<div class="btn-group d-flex justify-content-center" role="group" id="ball-design-option">
									<div class="form-group mt-4">
										<label for="ballDesign" class="col-form-label">${gameCustomizationModal[languageId].ballDesign}</label>
										<div class="btn-group d-flex justify-content-center mt-2" role="group" aria-label="ball-design-option">
											<input type="radio" name="ball-design-btn" class="btn-check" id="normal-ball" checked value="normal">
											<label class="btn btn-outline-primary me-2" for="normal-ball">${gameCustomizationModal[languageId].normalBall}</label>
											<input type="radio" name="ball-design-btn" class="btn-check" id="fancy-ball" value="fancy">
											<label class="btn btn-outline-primary" for="fancy-ball">${gameCustomizationModal[languageId].fancyBall}</label>
										</div>
									</div>
								</div>
									
								<div class="row mt-4 justify-content-center">
									<div class="col-4 text-center mt-4">
									    <button type="button" class="btn btn-danger w-100" data-bs-dismiss="modal">${gameCustomizationModal[languageId].close}</button>
									</div>
									<div class="col-4 text-center mt-4 ">
									    <button id="game-start-btn" type="submit" class="btn btn-success w-100">${gameCustomizationModal[languageId].start}</button>
									</div>
								</div>
							</form>
                        </div>
                    </div>
                </div>
		`;

		this.element = document.getElementById("game-customization-modal");
		this.element.innerHTML = view;
		this.handleEvent();
	}

	async handleEvent() {
		// Reset Form When Modal Closes
		this.element.addEventListener("hide.bs.modal", () => {
			this.element.querySelector("#game-customization-form").reset();
		});

		this.element
			.querySelector("#game-start-btn")
			.addEventListener("click", async (event) => {
				// Prevent Default Submit Behavior
				event.preventDefault();

				// Check Nickname is Empty
				if (this.element.querySelector("#nickname").value === "") {
					bootstrap.Modal.getOrCreateInstance(
						document.getElementById("invalid-nickname-modal")
					).show();
					return;
				}

				// Set Fancy Ball State
				const fancyBallValue = this.element.querySelector(
					'#ball-design-option input[name="ball-design-btn"]:checked'
				).value;
				store.dispatch("setFancyBall", { fancyBall: fancyBallValue });

				// 임시 랜덤 intraId 생성
				// TODO: auth 로직 구현 후 삭제
				function makeRandomName() {
					var name = "";
					var possible =
						"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
					for (var i = 0; i < 5; i++)
						name += possible.charAt(
							Math.floor(Math.random() * possible.length)
						);
					return name;
				}
				store.dispatch("setIntraId", { intraId: makeRandomName() });

				// Set Game Customization State
				const nickname = this.element.querySelector("#nickname").value;
				const speedUp = this.element.querySelector(
					'#speed-option input[name="speed-btn"]:checked'
				).value;

				// Hide Game Customization Modal
				bootstrap.Modal.getInstance(
					document.getElementById("game-customization-modal")
				).hide();

				// Show Opponent Waiting Modal
				console.log("show opponent waiting modal");
				bootstrap.Modal.getOrCreateInstance(
					document.getElementById("opponent-waiting-modal")
				).show();

				// Join Game and connect socket
				store.dispatch("joinGame", {
					intraId: store.state.intraId,
					gameMode: store.state.gameMode, // single or tournament로 수정하자
					nickname: nickname,
					speedUp: speedUp,
				});
			});
	}

	async hideGameCustomizationModal() {
		if (store.state.gameStatus !== "playing") return;
		console.log("hide game customization modal");
		const modalInstance = bootstrap.Modal.getInstance(this.element);
		if (modalInstance) modalInstance.hide();
	}
}
