import store from "../../../store/index.js";
import Component from "../../../library/component.js";
import { loginButton } from "../../utils/languagePack.js";
import logo from "../../../static/img/42_logo.svg";

export default class Login extends Component {
	constructor(params) {
		super({
			store,
			element: document.getElementById("loginBtn"),
		});
		this.render();
	}

	async render() {
		const languageId = store.state.languageId;

		const view = /*html*/`
            <a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-0f605dab356f53b97f60db2a5b5d6a1c102b0ad2a94b1719c1becd32e46a3209&redirect_uri=https%3A%2F%2F127.0.0.1%3A443%2Foauth&response_type=code" class="btn btn-primary text-white" role="button">
                <img src="${logo}" width="24" height="24" class="mr-2 align-middle" alt="42_logo">
                ${loginButton[languageId].loginDescription}
            </a>
        `;

		this.element = document.getElementById("loginBtn");
		this.element.innerHTML = view;
		this.handleEvent();
	}

	async handleEvent() {
		this.element.addEventListener("click", async (event) => {
			window.location.href = this.element.querySelector('a').getAttribute('href');
			// // Prevent Default Link Behavior
			// event.preventDefault();

			// // TODO 아래의 부분은 로그인 성공 후 실행되어야 하므로, 로그인 성공 후 실행되도록 수정해야 함.
			// // Change isLoggedIn State
			// store.dispatch("logIn");

			// // Language State Get Request
			// try {
			// 	const response = await fetch("/api/language", {
			// 		method: "GET",
			// 		headers: { "Content-Type": "application/json" },
			// 	});
			// 	const data = await response.json();
			// 	console.log(data);
			// 	if (data.status === "success") {
			// 		store.dispatch("setLanguage", {
			// 			languageId: data.languageId,
			// 		});
			// 	} else {
			// 		console.error(data);
			// 	}
			// } catch (error) {
			// 	console.error(error);
			// }
		});
	}
}
