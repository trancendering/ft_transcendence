/**
 * @fileoverview socket.io event handler
 * actions.js/joinGame에서 socket.on으로 받은 이벤트를 처리하는 함수들이다.
 * 다른 모듈은 이 파일의 함수를 사용할 수 없다.
 */
import { navigateTo } from "../views/utils/router.js";
import { Side } from "../enum/constant.js";
import io from "socket.io-client";

function connectSocket(context, payload) {
	// const url = "http://localhost:3000/" + payload.gameMode.toLowerCase();
	const url = "http://localhost:8000/game";
	// const url = "http://localhost:3000/game";

	console.log("connect to socket:");
	console.log(
		`> intraId=${payload.intraId}, nickname=${payload.nickname}, speedUp=${payload.speedUp}`
	);

	const socket = io(url, {
		query: {
			intraId: payload.intraId,
			nickname: payload.nickname,
			isSpeedUp: payload.speedUp,
		},
	});

	context.commit("setSocket", { socket: socket });

	return socket;
}

function printSocketError(error) {
	console.error("Connection Error:", error);
}

function startGame(context, payload) {
	console.log("on userFullEvent: startGame");

	const userSide =
		context.state.intraId === payload.leftUserId ? Side.LEFT : Side.RIGHT;

	context.commit("setGameInfo", {
		gameInfo: {
			roomName: payload.roomName,
			leftUser: payload.leftUserNickname,
			rightUser: payload.rightUserNickname,
			userSide: userSide,
		},
	});

	console.log(
		`> roomName=${payload.roomName}, leftUserId=${payload.leftUserId}, rightUserId=${payload.rightUserId}, leftUserNickname=${payload.leftUserNickname}, rightUserNickname=${payload.rightUserNickname}, userSide=${userSide}`
	);

	navigateTo("/game");
	context.commit("setGameStatus", { gameStatus: "playing" });
}

function updateGameState(context, payload) {
	// console.log("on updateGameStatus: ");
	// console.log(`> gameStatus=${payload.gameStatus}`);

	context.commit("updateBallPosition", {
		ballPosition: payload.ballPosition,
	});

	if (context.state.gameInfo.userSide === Side.LEFT) {
		context.commit("updateRightPaddlePosition", {
			rightPaddlePosition: payload.rightPaddlePosition,
		});
	} else {
		context.commit("updateLeftPaddlePosition", {
			leftPaddlePosition: payload.leftPaddlePosition,
		});
	}
}

function updateGameScore(context, payload) {
	// console.log("on updateGameScore: ");
	// console.log(`> leftUserScore=${payload.leftUserScore}, rightUserScore=${payload.rightUserScore}`);

	context.commit("updateLeftUserScore", {
		leftUserScore: payload.leftUserScore,
	});
	context.commit("updateRightUserScore", {
		rightUserScore: payload.rightUserScore,
	});
}

function endGame(context, payload) {
	console.log("on endGame: endGame");
	console.log(`> reason=${payload.reason}`);

	if (payload.reason === "normal") {
		if (context.state.leftUserScore > context.state.rightUserScore) {
			context.commit("setWinner", {
				winner: context.state.gameInfo.leftUser,
			});
		} else {
			context.commit("setWinner", {
				winner: context.state.gameInfo.rightUser,
			});
		}
	}
	// nest.js 서버 테스트시 사용. django 서버는 emit 문 주석 처리할 것
		// } else if (payload.reason === "opponentLeft") {
	// 	context.state.socket.emit("leaveGame", {
	// 		roomName: context.state.gameInfo.roomName,
	// 	});
	// }

	if (context.state.socket) {
		context.state.socket.disconnect();
		context.commit("setSocket", { socket: null });
	}
	context.commit("setEndReason", { endReason: payload.reason });
	context.commit("setGameStatus", { gameStatus: "ended" });
}

function updatePaddlePosition(context, payload) {
	context.state.socket.emit("updatePaddlePosition", {
		roomName: context.state.gameInfo.roomName,
		userSide: context.state.gameInfo.userSide,
		paddlePosition: payload.paddlePosition,
	});
}

export default {
	connectSocket,
	printSocketError,
	startGame,
	updateGameState,
	updateGameScore,
	endGame,
	updatePaddlePosition,
};
