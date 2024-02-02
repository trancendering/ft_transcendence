import store from "../../../store/index.js";
import Component from "../../../library/component.js";
import { invalidNicknameModal } from "../../utils/languagePack.js";

export default class InvalidNicknameModal extends Component {
	constructor() {
		super({ element: document.getElementById("invalidNicknameModal") });
		this.render();
	}

	async render() {
		const languageId = store.state.languageId;

		const view = /*html*/ `
			<div class="custom-modal-dialog">
				<div class="custom-modal-content">
					<div class="text-center p-lg-4">
						<svg width="150" height="150" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
							<circle class="path circle" fill="none" stroke="#db3646" stroke-width="6"
									stroke-miterlimit="10" cx="65.1" cy="65.1" r="62.1"/>
							<line class="path line" fill="none" stroke="#db3646" stroke-width="6"
								  stroke-linecap="round" stroke-miterlimit="10" x1="34.4" y1="37.9" x2="95.8"
								  y2="92.3"/>
							<line class="path line" fill="none" stroke="#db3646" stroke-width="6"
								  stroke-linecap="round" stroke-miterlimit="10" x1="95.8" y1="38" X2="34.4"
								  y2="92.2"/>
						</svg>
						<h4 class="text-danger mt-3">${invalidNicknameModal[languageId].title}</h4>
						<p class="mt-3">${invalidNicknameModal[languageId].description}</p>
						<button id="invalidNicknameModalCloseBtn" type="button" class="btn btn-sm mt-3 btn-danger">${invalidNicknameModal[languageId].ok}</button>
					</div>
				</div>
			</div>
		`;
		this.element = document.getElementById("invalidNicknameModal");
		this.element = this.element.innerHTML = view;
		this.handleEvent();
	}

	async handleEvent() {
		document
			.getElementById("invalidNicknameModalCloseBtn")
			.addEventListener("click", () => {
				document.getElementById("invalidNicknameModal").style.display =
					"none";
			});
	}
}
