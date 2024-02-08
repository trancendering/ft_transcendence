import store from "../../../store/index.js";
import Component from "../../../library/component.js";
import { logoutButton } from "../../utils/languagePack.js";
import logo from "../../../static/img/42_logo.svg";
import { navigateTo } from "../../utils/router.js";

export default class LogoutButton extends Component {
	constructor() {
		super({ element: document.getElementById("logoutBtn") });
		this.render();
	}

	async render() {
		const languageId = store.state.languageId;

		const view = /*html*/ `
            <a href="${process.env.LOGOUT_URL}" class="btn btn-lg btn-outline-danger text-red my-3 ms-4" role="button">
                ${logoutButton[languageId].logoutDescription}
            </a>
        `;

		this.element = document.getElementById("logoutBtn");
		this.element.innerHTML = view;
		this.handleEvent();
	}

	async handleEvent() {
		this.element.querySelector("a").addEventListener("click", () => {
			store.dispatch("logout");
			navigateTo("/login");
		});
	}
}
