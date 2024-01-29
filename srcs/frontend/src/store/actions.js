import SingleGameActionHandler from "./actions/singleGameActionHandler.js";
import TournamentActionHandler from "./actions/tournamentActionHandler.js";

function getGameHandler(context) {
	return context.state.gameMode === "Single"
		? SingleGameActionHandler.getInstance(context)
		: TournamentActionHandler.getInstance(context);
}

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

	const gameHandler = getGameHandler(context);
	gameHandler.connectSocket(payload);
	gameHandler.bindSocketEvents();
}

function startRound(context) {
	console.log("startRound: ");

	const gameHandler = getGameHandler(context);
	gameHandler.startRound();
}

function leaveGame(context) {
	console.log("leaveGame: ");

	const gameHandler = getGameHandler(context);
	gameHandler.endGame({ reason: "opponentLeft" });
}

function emitUserReadyEvent(context) {
	console.log("emitUserReadyEvent: ");

	const gameHandler = getGameHandler(context);
	gameHandler.emitUserReadyEvent();
}

function moveUserPaddleUp(context) {
	const gameHandler = getGameHandler(context);
	gameHandler.moveUserPaddleUp();
}

function moveUserPaddleDown(context) {
	const gameHandler = getGameHandler(context);
	gameHandler.moveUserPaddleDown();
}

export default {
	logIn,
	logOut,
	setIntraId,
	setLanguage,
	setGameMode,
	setFancyBall,
	joinGame,
	startRound,
	leaveGame,
	emitUserReadyEvent,
	moveUserPaddleDown,
	moveUserPaddleUp,
};
