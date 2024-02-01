import store from "../../../store/index.js";
import Component from "../../../library/component.js";
import { languageSelector } from "../../utils/languagePack.js";

export default class LanguageSelector extends Component {
	constructor() {
		super({ element: document.getElementById("languageSelector") });
		this.render();
	}

	async render() {
		const languageId = store.state.languageId;

		const view = /*html*/ `
            <div class="dropdown position-absolute top-0 end-0">
                <button class="btn dropdown-toggle mt-3 me-3" type="button" id="languageMenu" data-bs-toggle="dropdown" aria-expanded="false">
                	${languageSelector[languageId].language}
                </button>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton1">
                    <li><a class="dropdown-item" href="#" data-language-id="en">${languageSelector[languageId].english}</a></li>
                    <li><a class="dropdown-item" href="#" data-language-id="ko">${languageSelector[languageId].korean}</a></li>
                    <li><a class="dropdown-item" href="#" data-language-id="zh">${languageSelector[languageId].chinese}</a></li>
                </ul>
            </div>
        `;

		this.element = document.getElementById("languageSelector");
		this.element.innerHTML = view;
		this.handleEvent();
	}

	async handleEvent() {
		// Change Language
		document.querySelectorAll(".dropdown-item").forEach((item) => {
			item.addEventListener("click", async (event) => {
				// Prevent Default Link Behavior
				event.preventDefault();

				// Get Language Id (en, ko, zh)
				const languageId = item.dataset.languageId;

				// Change Language State
				store.dispatch("setLanguage", { languageId });

				const csrfToken = document.cookie
					.split("; ")
					.find((row) => row.startsWith("csrftoken="))
					.split("=")[1];

				// Language Change Post Request
				try {
					const response = await fetch("api/v1/change-language", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"X-CSRFToken": csrfToken,
						},
						body: JSON.stringify({ languageId }),
						credentials: "include",
					});
					const data = await response.json();
					console.log(data);
				} catch (err) {
					console.error(err);
				}
			});
		});
	}
}
