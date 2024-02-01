import store from "../../../store/index.js";
import Component from "../../../library/component.js";
import { tournamentRecordButton } from "../../utils/languagePack.js";

export default class TournamentRecordButton extends Component {
	constructor() {
		super({ element: document.getElementById("tournamentRecordBtn") });
		this.render();
	}

	async render() {
		const languageId = store.state.languageId;

		const view = /*html*/ `
			<a class="btn btn-outline-success text-green mt-3 ms-3" data-link href="/record" role="button">
				${tournamentRecordButton[languageId].record}
			</a>
        `;

		this.element = document.getElementById("tournamentRecordBtn");
		this.element.innerHTML = view;
	}
}
