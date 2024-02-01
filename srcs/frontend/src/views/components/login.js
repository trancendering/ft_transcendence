import store from "../../store/index.js";
import Component from "../../library/component.js";
import LoginButton from "./login/loginButton.js";
import { login } from "../utils/languagePack.js";

export default class Login extends Component {
	constructor() {
		super({ element: document.getElementById("app") });
		this.render();
		this.components = { loginButton: new LoginButton() };
	}

	async render() {
		const languageId = store.state.languageId;

		const view = /*html*/ `
            <div class="d-flex align-items-center justify-content-center vh-100 bg-light">
                  <div class="card shadow p-3 mb-5 bg-white rounded" style="max-width: 18rem;">
                      <div class="card-body text-center">
                          <h1 class="h3 mb-3 font-weight-bold">${login[languageId].title}</h1>
                      </div>
                      <div id="loginBtn"></div>
                  </div>
            </div>
        `;

		this.element.innerHTML = view;
	}
}
