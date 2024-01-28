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
	// const url = "http://localhost:8000/game";
	const url = `https://localhost/${payload.namespace}`;

	console.log("Connect socket:");
	console.log("  url=", url);
	console.log("  intraId=", payload.intraId);
	console.log("  nickname=", payload.nickname);
	console.log("  isSpeedUp=", payload.speedUp);

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

	const userIndex = payload.intraId.indexOf(context.state.intraId);
	const userSide = userIndex % 2 === 0 ? Side.LEFT : Side.RIGHT;

	// 게임 방 정보 세팅
	context.commit("setGameInfo", {
		gameInfo: {
			roomName: payload.roomName,
			intraId: payload.intraId,
			nickname: payload.nickname,
			userIndex: userIndex,
			userSide: userSide,
		},
	});

	console.log("EVENT: userFullEvent: startGame");
	console.log("  roomName=", payload.roomName);
	console.log("  intraId=", payload.intraId);
	console.log("  nickname=", payload.nickname);
	console.log("  userIndex=", userIndex);
	console.log("  userSide=", userSide);

	// 게임 시작 전 초기화
	context.dispatch("initPositions");
	context.dispatch("initScores");

	navigateTo("/game"); // 게임 페이지로 이동
	context.commit("setGameStatus", { gameStatus: "playing" });
}

function endGame(context, payload) {
	console.log("EVENT: endGame: endGame");
	console.log("  end reason=", payload.reason);

	if (payload.reason === "normal") {
		if (context.state.leftUserScore > context.state.rightUserScore) {
			context.commit("setWinner", {
				winner: context.state.gameInfo.nickname[0],
			});
		} else {
			context.commit("setWinner", {
				winner: context.state.gameInfo.nickname[1],
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

function updateGameState(context, payload) {
	// console.log("on updateGameStatus: ");
	// console.log(" gameStatus=", payload.gameStatus);

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
	endGame,
	updateGameState,
	updateGameScore,
	updatePaddlePosition,
};
