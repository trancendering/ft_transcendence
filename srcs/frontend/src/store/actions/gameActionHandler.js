import io from "socket.io-client";
import { Side, Game } from "../../enum/constant.js";

/**
 * @class gameActionHandler
 * @description 게임 관련 액션을 처리하는 클래스.
 *       singeGameActionHandler와 tournamentActionHandler의 부모 클래스.
 * @methods
 * connectSocket, bindSocketEvents, printSocketError: 소켓 연결 관련 메서드
 * startGame, endGame: 게임 시작/종료 관련 메서드(인터페이스)
 * initScores, initPositions: 게임 초기화 관련 메서드
 * updateGameContext, updateGameState, updateGameScore: 게임 상태 업데이트 메서드
 * emitUserReadyEvent: 유저가 준비되었다는 이벤트를 서버로 보내는 메서드
 * updatePaddlePosition: 패들 위치 업데이트 메서드
 * moveUserPaddleUp, moveUserPaddleDown: 키보드 입력에 따른 패들 이동 메서드
 */
export default class gameActionHandler {
	constructor(context) {
		this.context = context;
		this.socket = null;
		this.roomName = "";
		this.intraIdList = [];
		this.nicknameList = [];
		this.matchQueue = []; // 매칭 대기열, player의 index number를 저장
		this.userIndex = 0;
		this.userSide = 0;
	}

	/**
	 * @description 소켓 연결
	 * @param {object} payload {namespace, intraId, nickname, speedUp}
	 */
	async connectSocket(payload) {
		const url = `http://localhost:8000/${payload.namespace}`;

		this.socket = io(url, {
			query: {
				intraId: payload.intraId,
				nickname: payload.nickname,
				isSpeedUp: payload.speedUp,
			},
		});
	}

	/**
	 * @description 소켓 이벤트 핸들러 등록
	 */
	bindSocketEvents() {
		this.socket.on("connect_error", (error) => {
			this.printSocketError(error);
		});
		this.socket.on("userFullEvent", (data) => {
			this.startGame(data);
		});
		this.socket.on("updateGameStatus", (data) => {
			this.updateGameState(data);
		});
		this.socket.on("updateGameScore", (data) => {
			this.updateGameScore(data);
		});
		this.socket.on("endGame", (data) => {
			this.endGame(data);
		});
	}

	printSocketError(error) {
		console.error("Connection Error:", error);
	}

	async startGame(payload) {}

	async endGame(payload) {}

	/**
	 * @description 새 게임 시작할 때, 좌/우 플레이어 점수 초기화
	 */
	initScores() {
		console.log("initScores: ");
		this.context.commit("updateLeftUserScore", { leftUserScore: 0 });
		this.context.commit("updateRightUserScore", { rightUserScore: 0 });
		console.log("  left=", this.context.state.leftUserScore, " right=", this.context.state.rightUserScore);
	}

	/**
	 * @description 새 게임 시작할 때, 볼 및 패들 위치 초기화
	 */
	initPositions() {
		this.context.commit("updateBallPosition", {
			ballPosition: {
				x: 0,
				y: 0,
			},
		});
		this.context.commit("updateLeftPaddlePosition", {
			leftPaddlePosition: 0,
		});
		this.context.commit("updateRightPaddlePosition", {
			rightPaddlePosition: 0,
		});
	}

	/**
	 * @description 새 게임 시작할 때, 게임에 참여하는 유저 및 게임룸 정보 초기화
	 */
	updateGameContext() {
		const leftUserIndex = this.matchQueue[0];
		const rightUserIndex = this.matchQueue[1];
		const participated =
			leftUserIndex === this.userIndex ||
			rightUserIndex === this.userIndex;
		if (participated) {
			this.userSide =
				this.matchQueue.indexOf(this.userIndex) % 2 === 0
					? Side.LEFT
					: Side.RIGHT;
		}

		console.log("updateGameContext: ");
		console.log("  matchQueue: ", this.matchQueue);
		console.log(
			`  leftUserIndex=${leftUserIndex}, rightUserIndex=${rightUserIndex}`
		);
		console.log(`  participated=${participated}`);
		console.log(
			`  leftUser=${this.nicknameList[leftUserIndex]}, rightUser=${this.nicknameList[rightUserIndex]}`
		);
		console.log(`  userIndex=${this.userIndex}, userSide=${this.userSide}`);

		this.context.commit("setGameContext", {
			gameContext: {
				roomName: this.roomName,
				leftUser: this.nicknameList[leftUserIndex],
				rightUser: this.nicknameList[rightUserIndex],
				participated: participated,
				userSide: this.userSide,
			},
		});
	}

	/**
	 * @description 볼 위치와 패들 위치 업데이트
	 * @param {object} payload {ballPosition: {x, y}, leftPaddlePosition, rightPaddlePosition}
	 */
	updateGameState(payload) {
		const gameContext = this.context.state.gameContext;

		this.context.commit("updateBallPosition", {
			ballPosition: payload.ballPosition,
		});

		if (
			gameContext.participated === false ||
			gameContext.userSide === Side.LEFT
		) {
			this.context.commit("updateRightPaddlePosition", {
				rightPaddlePosition: payload.rightPaddlePosition,
			});
		}
		if (
			gameContext.participated === false ||
			gameContext.userSide === Side.RIGHT
		) {
			this.context.commit("updateLeftPaddlePosition", {
				leftPaddlePosition: payload.leftPaddlePosition,
			});
		}
	}

	/**
	 * @description 현재 게임 중인 좌/우 플레이어의 점수 업데이트
	 * @param {object} payload {leftUserScore, rightUserScore}
	 */
	updateGameScore(payload) {
		console.log(
			"updateGameScore: left=",
			payload.leftUserScore,
			"right=",
			payload.rightUserScore
		);
		this.context.commit("updateLeftUserScore", {
			leftUserScore: payload.leftUserScore,
		});
		this.context.commit("updateRightUserScore", {
			rightUserScore: payload.rightUserScore,
		});
	}

	/**
	 * @description 유저가 준비되었다는 이벤트를 서버로 보냄
	 */
	async emitUserReadyEvent() {
		const state = this.context.state;

		// if (!this.socket)
		// 	return;
		this.socket.emit("userReadyEvent", {
			roomName: state.gameContext.roomName,
		});
	}

	/**
	 * @description 패들 위치 업데이트 되었다는 이벤트를 서버로 보냄
	 * @param {object} payload {paddlePosition}
	 */
	async updatePaddlePosition(payload) {
		const context = this.context;
		const state = this.context.state;
		const paddlePosition = payload.paddlePosition;

		if (state.gameContext.userSide === Side.LEFT) {
			context.commit("updateLeftPaddlePosition", {
				leftPaddlePosition: paddlePosition,
			});
		} else {
			context.commit("updateRightPaddlePosition", {
				rightPaddlePosition: paddlePosition,
			});
		}
		// if (!this.socket)
			// return;
		this.socket.emit("updatePaddlePosition", {
			roomName: state.gameContext.roomName,
			userSide: state.gameContext.userSide,
			paddlePosition: paddlePosition,
		});
	}

	/**
	 * @description 사용자가 패들을 위로 이동시키는 이벤트를 서버로 보냄
	 */
	async moveUserPaddleUp() {
		const context = this.context;
		const state = context.state;

		const curPosition =
			state.gameContext.userSide === Side.LEFT
				? state.leftPaddlePosition
				: state.rightPaddlePosition;
		const newPosition = Math.min(
			curPosition + 10,
			Game.CANVAS_HEIGHT / 2 - Game.PADDLE_HEIGHT / 2
		);
		if (newPosition === undefined) {
			console.log("moveUserPaddleUp: new position undefined");
			return;
		}
		console.log(`moveUserPaddleUp: position=${newPosition}`);
		this.updatePaddlePosition({ paddlePosition: newPosition });
	}

	/**
	 * @description 사용자가 패들을 아래로 이동시키는 이벤트를 서버로 보냄
	 */
	async moveUserPaddleDown() {
		const context = this.context;
		const state = context.state;

		const curPosition =
			state.gameContext.userSide === Side.LEFT
				? state.leftPaddlePosition
				: state.rightPaddlePosition;
		const newPosition = Math.max(
			curPosition - 10,
			-Game.CANVAS_HEIGHT / 2 + Game.PADDLE_HEIGHT / 2
		);
		if (newPosition === undefined) {
			console.log("moveUserPaddleDown: new position undefined");
			return;
		}
		console.log(`moveUserPaddleDown: position=${newPosition}`);
		this.updatePaddlePosition({ paddlePosition: newPosition });
	}
}
