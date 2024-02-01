import store from "../../../store/index.js";
import Component from "../../../library/component.js";
import { loginButton } from "../../utils/languagePack.js";
import logo from "../../../static/img/42_logo.svg";

export default class Login extends Component {
	constructor() {
		super({ element: document.getElementById("loginBtn") });
		this.render();
	}

	async render() {
		const languageId = store.state.languageId;

		// TODO url env로 변경
		const view = /*html*/ `
            <a href="https://localhost/api/v1/login" class="btn btn-primary text-white" role="button">
                <img src="${logo}" width="24" height="24" class="mr-2 align-middle" alt="42_logo">
                ${loginButton[languageId].loginDescription}
            </a>
        `;

		this.element = document.getElementById("loginBtn");
		this.element.innerHTML = view;
	}
}
