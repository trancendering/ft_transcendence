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

function joinSingleGame(context, payload) {
	console.log("joinSingleGame: ");
	const socket = socketHandler.connectSocket(context, {
		...payload,
		namespace: "single",
	});

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

function initPositions(context) {
	context.commit("updateBallPosition", {
		ballPosition: {
			x: Game.CANVAS_WIDTH / 2,
			y: Game.CANVAS_HEIGHT / 2,
		},
	});
	context.commit("updateLeftPaddlePosition", {
		leftPaddlePosition: Game.CANVAS_HEIGHT / 2
	});
	context.commit("updateRightPaddlePosition", {
		rightPaddlePosition: Game.CANVAS_HEIGHT / 2
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
	joinSingleGame,
	leaveGame,
	userIsReady,
	initPositions,
	initScores,
	moveUserPaddleDown,
	moveUserPaddleUp,
};
