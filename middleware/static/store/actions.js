// import { io } from "socket.io-client";
import { Side, Game } from "../enum/constant.js";
import socketHandler from "./socketHandler.js";

function logIn(context) {
	context.commit("logIn");
}

function logOut(context) {
	context.commit("logOut");
}

function setIntraId(context, payload) {
	context.commit("setIntraId", payload);
}

function setLanguage(context, payload) {
	context.commit("setLanguage", payload);
}

function setGameMode(context, payload) {
	context.commit("setGameMode", payload);
}

function setFancyBall(context, payload) {
	context.commit("setFancyBall", payload);
}

function joinGame(context, payload) {
	console.log("joinGame: ");
	const socket = socketHandler.connectSocket(context, payload);

	socket.on("connect_error", (error) => {
		socketHandler.printSocketError(error);
	});
	socket.on("userFullEvent", (data) => {
		socketHandler.startGame(context, data);
	});
	socket.on("updateGameStatus", (data) => {
		socketHandler.updateGameState(context, data);
	});
	socket.on("updateGameScore", (data) => {
		socketHandler.updateGameScore(context, data);
	});
	socket.on("endGame", (data) => {
		socketHandler.endGame(context, { reason: data.reason });
	});
}

function leaveGame(context) {
	// nest.js 서버 테스트시 사용. django 서버는 emit 문 주석 제거할 것
	socketHandler.endGame(context, { reason: "opponentLeft" });
}

function userIsReady(context) {
	context.state.socket.emit("userReadyEvent", {
		roomName: context.state.gameInfo.roomName,
	});
}

function initPositions(context, payload) {
	context.commit("updateBallPosition", {
		ballPosition: payload.ballPosition,
	});
	context.commit("updateLeftPaddlePosition", {
		leftPaddlePosition: payload.leftPaddlePosition,
	});
	context.commit("updateRightPaddlePosition", {
		rightPaddlePosition: payload.rightPaddlePosition,
	});
}

function initScores(context) {
	context.commit("updateLeftUserScore", { leftUserScore: 0 });
	context.commit("updateRightUserScore", { rightUserScore: 0 });
}

function moveUserPaddleUp(context) {
	if (context.state.gameStatus !== "playing") return;

	const curPosition =
		context.state.gameInfo.userSide === Side.LEFT
			? context.state.leftPaddlePosition
			: context.state.rightPaddlePosition;
	const newPosition = Math.max(curPosition - 10, Game.PADDLE_HEIGHT / 2);

	if (newPosition === undefined) {
		console.log("moveUserPaddleUp: new position undefined");
		return;
	}

	console.log(`moveUserPaddleUp: position=${newPosition}`);

	if (context.state.gameInfo.userSide === Side.LEFT) {
		context.commit("updateLeftPaddlePosition", {
			leftPaddlePosition: newPosition,
		});
	} else {
		context.commit("updateRightPaddlePosition", {
			rightPaddlePosition: newPosition,
		});
	}
	socketHandler.updatePaddlePosition(context, {
		paddlePosition: newPosition,
	});
}

function moveUserPaddleDown(context) {
	if (context.state.gameStatus !== "playing") return;

	const curPosition =
		context.state.gameInfo.userSide === Side.LEFT
			? context.state.leftPaddlePosition
			: context.state.rightPaddlePosition;
	const newPosition = Math.min(
		curPosition + 10,
		Game.CANVAS_HEIGHT - Game.PADDLE_HEIGHT / 2
	);

	if (newPosition === undefined) {
		console.log("moveUserPaddleDown: new position undefined");
		return;
	}
	console.log(`moveUserPaddleDown: position=${newPosition}`);

	if (context.state.gameInfo.userSide == Side.LEFT) {
		context.commit("updateLeftPaddlePosition", {
			leftPaddlePosition: newPosition,
		});
	} else {
		context.commit("updateRightPaddlePosition", {
			rightPaddlePosition: newPosition,
		});
	}

	socketHandler.updatePaddlePosition(context, {
		paddlePosition: newPosition,
	});
}

export default {
	logIn,
	logOut,
	setIntraId,
	setLanguage,
	setGameMode,
	setFancyBall,
	joinGame,
	leaveGame,
	userIsReady,
	initPositions,
	initScores,
	moveUserPaddleDown,
	moveUserPaddleUp,
};
