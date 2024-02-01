import store from "../../../store/index.js";
import Component from "../../../library/component.js";
import { gameCustomizationModal } from "../../utils/languagePack.js";

export default class GameCustomizationModal extends Component {
	constructor() {
		super({ element: document.getElementById("gameCustomizationModal") });
		this.render();
	}

	async render() {
		const languageId = store.state.languageId;

		const view = /*html*/ `
					<div class="custom-modal-dialog">
                        <div class="custom-modal-content">
                            <div class="text-center p-lg-4">

			                	<form id="gameCustomizationForm">
									<h3 class="text-dark mt-3">${gameCustomizationModal[languageId].setting}</h3>
									<div class="row justify-content-center">
										<div class="form-group col-md-6 col-lg-10">
											<label for="nickname" class="col-form-label mt-4">${gameCustomizationModal[languageId].nickname}</label>
											<input type="text" class="form-control mt-2" id="nickname" required>
										</div>
									</div>

									<!-- speed Option -->
									<div class="btn-group d-flex justify-content-center" role="group" id="speedOption">
										<div class="form-group mt-4">
											<span class="col-form-label">${gameCustomizationModal[languageId].speed}</span>
											<div class="btn-group d-flex justify-content-center mt-2" role="group" aria-label="speedOption">
												<input type="radio" name="speedBtn" class="btn-check" id="normalSpeed" checked value="normal">
												<label class="btn btn-outline-primary me-2" for="normalSpeed">${gameCustomizationModal[languageId].normalSpeed}</label>
												<input type="radio" name="speedBtn" class="btn-check" id="fastSpeed" value="fast">
												<label class="btn btn-outline-primary" for="fastSpeed">${gameCustomizationModal[languageId].fastSpeed}</label>
											</div>
										</div>
									</div>

									<!-- ballDesign Option -->
									<div class="btn-group d-flex justify-content-center" role="group" id="ballDesignOption">
										<div class="form-group mt-4">
											<span class="col-form-label">${gameCustomizationModal[languageId].ballDesign}</span>
											<div class="btn-group d-flex justify-content-center mt-2" role="group" aria-label="ballDesignOption" id>
												<input type="radio" name="ballDesignBtn" class="btn-check" id="normalBall" checked value="normal">
												<label class="btn btn-outline-primary me-2" for="normalBall">${gameCustomizationModal[languageId].normalBall}</label>
												<input type="radio" name="ballDesignBtn" class="btn-check" id="fancyBall" value="fancy">
												<label class="btn btn-outline-primary" for="fancyBall">${gameCustomizationModal[languageId].fancyBall}</label>
											</div>
										</div>
									</div>

									<div class="row mt-4 justify-content-center">
										<div class="col-4 text-center mt-4">
											<button id="gameCustomizationModalCloseBtn" type="button" class="btn btn-danger w-100">${gameCustomizationModal[languageId].close}</button>
										</div>
										<div class="col-4 text-center mt-4 ">
											<button id="gameStartBtn" type="submit" class="btn btn-success w-100">${gameCustomizationModal[languageId].start}</button>
										</div>
									</div>
								</form>
                     	   </div>
                    	</div>
					</div>
		`;

		this.element = document.getElementById("gameCustomizationModal");
		this.element.innerHTML = view;
		this.handleEvent();
	}

	async handleEvent() {
		// Reset Form When Modal Closes
		document
			.getElementById("gameCustomizationModalCloseBtn")
			.addEventListener("click", () => {
				this.element.querySelector("#gameCustomizationForm").reset();
				document.getElementById(
					"gameCustomizationModal"
				).style.display = "none";
			});

		this.element
			.querySelector("#gameStartBtn")
			.addEventListener("click", async (event) => {
				// Prevent Default Submit Behavior
				event.preventDefault();

				// Check Nickname is Empty or too long or non-English
				const nickname = this.element.querySelector("#nickname").value;
				const englishCheck = /^[A-Za-z]+$/;

				if (
					nickname === "" ||
					nickname.length > 10 ||
					!englishCheck.test(nickname)
				) {
					document.getElementById(
						"invalidNicknameModal"
					).style.display = "flex";
					return;
				}

				// Set Fancy Ball State
				const fancyBallValue = this.element.querySelector(
					'#ballDesignOption input[name="ballDesignBtn"]:checked'
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
				const speedUp = this.element.querySelector(
					'#speedOption input[name="speedBtn"]:checked'
				).value;

				// Hide Game Customization Modal
				document.getElementById(
					"gameCustomizationModal"
				).style.display = "none";

				// Show Opponent Waiting Modal
				document.getElementById("opponentWaitingModal").style.display =
					"flex";

				// Join Game and connect socket
				// store.dispatch(`join${store.state.gameMode}Game`, {
				// 	intraId: store.state.intraId,
				// 	nickname: nickname,
				// 	speedUp: speedUp,
				// });

				// Join Game
				store.dispatch("joinGame", {
					namespace: store.state.gameMode.toLowerCase(),
					intraId: store.state.intraId,
					nickname: nickname,
					speedUp: speedUp,
				});
			});
	}
}
