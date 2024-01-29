import store from "../../../store/index.js";
import Component from "../../../library/component.js";
import { Side, Game } from "../../../enum/constant.js";

export default class gameCanvas extends Component {
	constructor(params) {
		super({
			store,
			element: document.getElementById("gameCanvas"),
		});
		this.ctx = this.element.getContext("2d");

		store.dispatch("initPositions", {
			ballPosition: {
				x: Game.CANVAS_WIDTH / 2,
				y: Game.CANVAS_HEIGHT / 2,
			},
			leftPaddlePosition: Game.CANVAS_HEIGHT / 2,
			rightPaddlePosition: Game.CANVAS_HEIGHT / 2,
		});
		store.dispatch("initScores");

		this.render();
		this.handleEvent();
		store.events.subscribe("ballPositionChange", async () => this.render());
		store.events.subscribe("scoreChange", async () => this.render());
	}

	async render() {
		const newElement = document.getElementById("gameCanvas");
		if (this.element !== newElement) {
			this.element = newElement;
			this.ctx = this.element.getContext("2d");
		}

		this.drawObjects();
		this.drawScores();
	}

	async handleEvent() {
		document.addEventListener("keydown", (e) => {
			if (store.state.gameStatus !== "playing") return;
			if (e.key == "ArrowUp") {
				store.dispatch("moveUserPaddleUp");
			} else if (e.key == "ArrowDown") {
				store.dispatch("moveUserPaddleDown");
			}
		});
	}

	async drawObjects() {
		this.ctx.fillStyle = "#000";
		this.ctx.fillRect(0, 0, Game.CANVAS_WIDTH, Game.CANVAS_HEIGHT);
		this.drawPaddle("left");
		this.drawPaddle("right");
		this.drawBall();
	}

	async drawPaddle(side) {
		const x = side === "left" ? 0 : Game.CANVAS_WIDTH - Game.PADDLE_WIDTH;
		const y =
			side === "left"
				? store.state.leftPaddlePosition
				: store.state.rightPaddlePosition;

		this.ctx.beginPath();
		this.ctx.rect(
			x,
			y - Game.PADDLE_HEIGHT / 2,
			Game.PADDLE_WIDTH,
			Game.PADDLE_HEIGHT
		);
		this.ctx.fillStyle = "#FFF";
		this.ctx.fill();
		this.ctx.closePath();
	}

	async drawBall() {
		const { x, y } = store.state.ballPosition;
		this.ctx.beginPath();
		this.ctx.arc(x, y, Game.BALL_RADIUS, 0, Math.PI * 2);
		this.ctx.fillStyle = "#FFF";
		this.ctx.fill();
		this.ctx.closePath();
	}

	async drawScores() {
		this.ctx.font = "20px Arial";

		const gameInfo = store.state.gameInfo;
		const leftDesignator = gameInfo.userSide === Side.LEFT ? "(Me)" : "";
		const rightDesignator = gameInfo.userSide === Side.RIGHT ? "(Me)" : "";
		const leftUserText = `${gameInfo.nickname[0]} ${leftDesignator}: ${store.state.leftUserScore}`;
		const rightUserText = `${gameInfo.nickname[1]} ${rightDesignator}: ${store.state.rightUserScore}`;

		const leftUserTextX = 30;
		const rightUserTextX =
			Game.CANVAS_WIDTH - 30 - this.ctx.measureText(rightUserText).width;
		this.ctx.fillText(leftUserText, leftUserTextX, 30);
		this.ctx.fillText(rightUserText, rightUserTextX, 30);
	}
}
