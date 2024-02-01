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

		// TODO: 환경변수 불러와서 base url 적용하기
		const view = /*html*/`
            <a href="https://localhost:443/api/v1/login" class="btn btn-primary text-white" role="button">
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
