import store from "../../../store/index.js";
import Component from "../../../library/component.js";
import BGM from "../../../static/sounds/pacman.mp3";

export default class BackgroundMusic extends Component {
	constructor() {
		super({ element: document.getElementById("bgm") });
		this.render();
		store.events.subscribe("musicOnChange", async () => this.playMusic());
	}

	async render() {
		const view = /*html*/ `
			<source src="${BGM}" type="audio/mpeg">
        `;

		this.element = document.getElementById("bgm");
		this.element.innerHTML = view;
	}

	async playMusic() {
		const audio = document.getElementById("bgm");
		if (store.state.musicOn) {
			audio.play();
		} else {
			audio.pause();
		}
	}
}
