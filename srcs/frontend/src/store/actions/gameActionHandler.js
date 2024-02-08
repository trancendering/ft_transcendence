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
		this.gameEnded = true;
		this.roomName = "";
		this.socketIdList = [];
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

	connectSocket(payload) {
		const url = `${process.env.SOCKET_URL}/${payload.namespace}`;

		//console.log("connectSocket:");
		//console.log(" - url=", url);
		//console.log(" - intraId=", payload.intraId);
		//console.log(" - nickname=", payload.nickname);
		//console.log(" - speedUp=", payload.speedUp);

		if (!this.socket) {
			this.socket = io(url, {
				query: {
					intraId: payload.intraId,
					nickname: payload.nickname,
					isSpeedUp: payload.speedUp,
				},
				forceNew: true,
			});
			this.bindSocketEvents();
		} else {
			this.socket.io.opts.query = `intraId=${payload.intraId}&nickname=${payload.nickname}&isSpeedUp=${payload.speedUp}`;
			this.socket.connect();
		}
		this.gameEnded = false;
	}

	/**
	 * @description 소켓 이벤트 핸들러 등록
	 */
	bindSocketEvents() {
		//console.log("bindSocketEvents:");
		this.socket.on("connect_error", (error) => {
			this.printSocketError(error);
		});
		this.socket.on("userFullEvent", (data) => {
			this.startGame(data);
		});
		// this.socket.on("updateGameStatus", (data) => {
		// 	this.updateGameState(data);
		// });
		this.socket.on("updateBallState", (data) => {
			this.updateBallState(data);
		});
		this.socket.on("updatePaddlePosition", (data) => {
			this.updatePaddlePosition(data);
		});
		this.socket.on("updateGameScore", (data) => {
			this.updateGameScore(data);
		});
		this.socket.on("endGame", (data) => {
			this.endGame(data);
		});
	}

	printSocketError(error) {
		//console.error("Connection Error:", error);
	}

	async startGame(payload) {}

	async endGame(payload) {}

	/**
	 * @description 새 게임 시작할 때, 좌/우 플레이어 점수 초기화
	 */
	initScores() {
		//console.log("initScores: ");
		this.context.commit("updateLeftUserScore", { leftUserScore: 0 });
		this.context.commit("updateRightUserScore", { rightUserScore: 0 });
		//console.log(" - left=", this.context.state.leftUserScore, " right=", this.context.state.rightUserScore);
	}

	/**
	 * @description 새 게임 시작할 때, 볼 및 패들 위치 초기화
	 */
	initPositions() {
		//console.log("initPositions: ");
		this.context.commit("updateBallPosition", {
			ballPosition: {
				x: 0,
				y: 0,
			},
		});
		this.context.commit("updateBallVelocity", {
			ballVelocity: {
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
		const participated = leftUserIndex === this.userIndex || rightUserIndex === this.userIndex;
		if (participated) {
			this.userSide = this.matchQueue.indexOf(this.userIndex) % 2 === 0 ? Side.LEFT : Side.RIGHT;
		}

		//console.log("updateGameContext: ");
		//console.log(" - matchQueue=", this.matchQueue);
		//console.log(" - leftUserIndex=", leftUserIndex);
		//console.log(" - rightUserIndex=", rightUserIndex);
		//console.log(" - leftUser=", this.nicknameList[leftUserIndex]);
		//console.log(" - rightUser=", this.nicknameList[rightUserIndex]);
		//console.log(" - participated=", participated);
		//console.log(" - userIndex=", this.userIndex);
		//console.log(" - userSide=", this.userSide);

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

	// /**
	//  * @description 볼 위치와 패들 위치 업데이트
	//  * @param {object} payload {ballPosition: {x, y}, leftPaddlePosition, rightPaddlePosition}
	//  */
	// updateGameState(payload) {
	// 	this.context.commit("updateBallPosition", {
	// 		ballPosition: payload.ballPosition,
	// 	});
	// 	this.context.commit("updateRightPaddlePosition", {
	// 		rightPaddlePosition: payload.rightPaddlePosition,
	// 	});
	// 	this.context.commit("updateLeftPaddlePosition", {
	// 		leftPaddlePosition: payload.leftPaddlePosition,
	// 	});
	// }

	/**
	 * @description 볼 위치 업데이트
	 * @param {object} payload {ballPosition: {x, y}, ballVelocity: {x, y}}
	 */
	updateBallState(payload) {
		//console.groupCollapsed("EVENT: ballCollisionEvent");
		//console.log(" - ballPosition={x=", payload.ballPosition.x, ", y=", payload.ballPosition.y, "}");
		//console.log(" - ballVelocity={x=", payload.ballVelocity.x, ", y=", payload.ballVelocity.y, "}");
		//console.groupEnd();

		this.context.commit("updateBallPosition", {
			ballPosition: payload.ballPosition,
		});
		this.context.commit("updateBallVelocity", {
			ballVelocity: payload.ballVelocity,
		});
	}

	/**
	 * @description 패들 위치 업데이트
	 * @param {object} payload {left, right}
	 */
	updatePaddlePosition(payload) {
		// 현재 게임 중인 사용자의 플레이어 사이드
		const userSide = this.context.state.gameContext.userSide;

		// 토너먼트 참여 안할 시 양쪽 패들 위치 업데이트
		if (this.context.state.gameContext.participated === false) {
			this.context.commit("updateRightPaddlePosition", {
				rightPaddlePosition: payload.right,
			});
			this.context.commit("updateLeftPaddlePosition", {
				leftPaddlePosition: payload.left,
			});
			return;
		}

		// 상대방 플레이어의 패들 위치만 업데이트
		if (userSide === Side.LEFT) {
			this.context.commit("updateRightPaddlePosition", {
				rightPaddlePosition: payload.right,
			});
		} else {
			this.context.commit("updateLeftPaddlePosition", {
				leftPaddlePosition: payload.left,
			});
		}
	}

	/**
	 * @description 현재 게임 중인 좌/우 플레이어의 점수 업데이트
	 * @param {object} payload {leftUserScore, rightUserScore}
	 */
	updateGameScore(payload) {
		//console.groupCollapsed("EVENT: updateGameScore");
		//console.log(" - left=", payload.leftUserScore);
		//console.log(" - right=", payload.rightUserScore);
		//console.groupEnd();

		this.context.commit("updateLeftUserScore", {
			leftUserScore: payload.leftUserScore,
		});
		this.context.commit("updateRightUserScore", {
			rightUserScore: payload.rightUserScore,
		});
	}

	/**
	 * @description 클라이언트에서 공의 위치를 추적하여 주기적으로 업데이트
	 */
	async trackBallPosition() {
		const ballPosition = this.context.state.ballPosition;
		const ballVelocity = this.context.state.ballVelocity;

		let newX = ballPosition.x,
			newY = ballPosition.y;
		if (newY > -195 && newY < 195) {
			newX = Math.max(Math.min(ballPosition.x + ballVelocity.x, 395), -395);
		}
		if (newX > -395 && newX < 395) {
			newY = Math.max(Math.min(ballPosition.y + ballVelocity.y, 195), -195);
		}
		if (newY === 195 || newY === -195) newX = ballPosition.x;
		this.context.commit("updateBallPosition", {
			ballPosition: { x: newX, y: newY },
		});
		if (!this.gameEnded) {
			setTimeout(() => {
				this.trackBallPosition();
			}, 1000 / 60);
		}
	}

	/**
	 * @description 유저가 준비되었다는 이벤트를 서버로 보냄
	 */
	emitUserReadyEvent() {
		const state = this.context.state;

		if (this.gameEnded) return;
		this.socket.emit("userReadyEvent", {
			roomName: state.gameContext.roomName,
		});
	}

	/**
	 * @description 패들 위치 업데이트 되었다는 이벤트를 서버로 보냄
	 * @param {object} payload {paddlePosition}
	 */
	async sendPaddlePosition(payload) {
		const gameContext = this.context.state.gameContext;
		const paddlePosition = payload.paddlePosition;

		if (this.gameEnded) return;
		this.socket.emit("sendPaddlePosition", {
			roomName: gameContext.roomName,
			userSide: gameContext.userSide,
			paddlePosition: paddlePosition,
		});
	}

	/**
	 * @description 사용자가 패들을 위로 이동시키는 이벤트를 서버로 보냄
	 */
	async moveUserPaddleUp() {
		const userSide = this.context.state.gameContext.userSide;
		const curPosition =
			userSide === Side.LEFT ? this.context.state.leftPaddlePosition : this.context.state.rightPaddlePosition;

		const newPosition = Math.min(curPosition + 40, Game.CANVAS_HEIGHT / 2 - Game.PADDLE_HEIGHT / 2);
		if (curPosition == newPosition || newPosition === undefined) {
			//console.log("moveUserPaddleUp: new position undefined");
			return;
		}
		//console.log(`moveUserPaddleUp: position=${newPosition}`);

		// 자신의 패들 위치를 업데이트
		if (userSide === Side.LEFT) {
			this.context.commit("updateLeftPaddlePosition", {
				leftPaddlePosition: newPosition,
			});
		} else {
			this.context.commit("updateRightPaddlePosition", {
				rightPaddlePosition: newPosition,
			});
		}

		this.sendPaddlePosition({ paddlePosition: newPosition });
	}

	/**
	 * @description 사용자가 패들을 아래로 이동시키는 이벤트를 서버로 보냄
	 */
	async moveUserPaddleDown() {
		const userSide = this.context.state.gameContext.userSide;
		const curPosition =
			userSide === Side.LEFT ? this.context.state.leftPaddlePosition : this.context.state.rightPaddlePosition;

		const newPosition = Math.max(curPosition - 40, -Game.CANVAS_HEIGHT / 2 + Game.PADDLE_HEIGHT / 2);
		if (curPosition == newPosition || newPosition === undefined) {
			//console.log("moveUserPaddleDown: new position undefined");
			return;
		}
		//console.log(`moveUserPaddleDown: position=${newPosition}`);

		if (userSide === Side.LEFT) {
			this.context.commit("updateLeftPaddlePosition", {
				leftPaddlePosition: newPosition,
			});
		} else {
			this.context.commit("updateRightPaddlePosition", {
				rightPaddlePosition: newPosition,
			});
		}

		this.sendPaddlePosition({ paddlePosition: newPosition });
	}
}
