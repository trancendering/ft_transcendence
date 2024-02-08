import store from "../../../store/index.js";
import Component from "../../../library/component.js";
import { Side } from '../../../enum/constant.js';

export default class gameScoreBoard extends Component {
	constructor() {
		super({ element: document.getElementById("gameScoreBoard") });
		store.events.subscribe("gameStatusChange", async () => this.render());
		store.events.subscribe("leftUserScoreChange", async () => this.updateLeftUserScore());
		store.events.subscribe("rightUserScoreChange", async () => this.updateRightUserScore());
	}

	async render() {
		console.log("gameScoreBoard render");
		if (store.state.gameStatus !== "playing") return;

		let leftUserNickname = store.state.gameContext.leftUser;
		if (store.state.gameContext.participated && store.state.gameContext.userSide === Side.LEFT) {
			leftUserNickname += " (ME)";
		}

		let rightUserNickname = store.state.gameContext.rightUser;
		if (store.state.gameContext.participated && store.state.gameContext.userSide === Side.RIGHT) {
			rightUserNickname += " (ME)";
		}

		const view = /*html*/ `
        	<div class="nickname" id="leftUser">${leftUserNickname}</div>
			<div class="score-board-number" id="score-board-number">0  :  0</div>
        	<div class="nickname" id="rightUser">${rightUserNickname}</div>
		`;

		this.element = document.getElementById("gameScoreBoard");
		this.element.innerHTML = view;
	}

	async updateLeftUserScore() {
		const score = document.getElementById("score-board-number");
		score.textContent = `${store.state.leftUserScore}  :  ${score.textContent.split(':')[1]}`;
	}

	async updateRightUserScore() {
		const score = document.getElementById("score-board-number");
		score.textContent = `${score.textContent.split(':')[0]}  :  ${store.state.rightUserScore}`;
	}
}
