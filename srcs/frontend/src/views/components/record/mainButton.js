import store from "../../../store/index.js";
import Component from "../../../library/component.js";
import { mainButton } from "../../utils/languagePack.js";

export default class TournamentRecordButton extends Component {
	constructor() {
		super({ element: document.getElementById("mainBtn") });
		this.render();
	}

	async render() {
		const languageId = store.state.languageId;

		const view = /*html*/ `
			<a class="btn btn-lg btn-outline-success text-green my-3 ms-4" data-link href="/" role="button">
				${mainButton[languageId].main}
			</a>
        `;

		this.element = document.getElementById("mainBtn");
		this.element.innerHTML = view;
	}
}
