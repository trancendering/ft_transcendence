import store from "../../../store/index.js";
import Component from "../../../library/component.js";
import playBtnImg from "../../../static/img/playButton.svg";
import pauseBtnImg from "../../../static/img/pauseButton.svg";

export default class AudioButton extends Component {
	constructor() {
		super({ element: document.getElementById("audioBtn") });
		this.render();
		store.events.subscribe("musicOnChange", async () => this.render());
	}

	async render() {
		const img = store.state.musicOn ? pauseBtnImg : playBtnImg;
		const view = /*html*/ `
			<button class="btn btn-warning text-black" role="button">
				<img src="${img}" width="24" height="24" class="mr-2 align-middle" alt="audioBtn">
			</button>
		`;

		this.element = document.getElementById("audioBtn");
		this.element.innerHTML = view;
		this.handleEvent();
	}

	async handleEvent() {
		this.element.querySelector("button").addEventListener("click", () => {
			// console.log("click audio button");
			store.dispatch("toggleMusicOn");
		});
	}
}
