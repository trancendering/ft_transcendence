// login
function logIn(state) {
	state.isLoggedIn = true;
	return state;
}

function logOut(state) {
	state.isLoggedIn = false;
	return state;
}

function setIntraId(state, payload) {
	state.intraId = payload.intraId;
	return state;
}

// main
function setLanguage(state, payload) {
	state.languageId = payload.languageId;
	return state;
}

function setGameMode(state, payload) {
	state.gameMode = payload.gameMode;
	return state;
}

function setFancyBall(state, payload) {
	state.fancyBall = payload.fancyBall;
	return state;
}

// Set Game Status
function setGameStatus(state, payload) {
	state.gameStatus = payload.gameStatus;
	return state;
}

// game start
function setSocket(state, payload) {
	state.socket = payload.socket;
	return state;
}

function setGameInfo(state, payload) {
	state.gameInfo = payload.gameInfo;
	return state;
}

// real-time game update
function updateBallPosition(state, payload) {
	state.ballPosition = payload.ballPosition;
	return state;
}

function updateLeftPaddlePosition(state, payload) {
	state.leftPaddlePosition = payload.leftPaddlePosition;
	return state;
}

function updateRightPaddlePosition(state, payload) {
	state.rightPaddlePosition = payload.rightPaddlePosition;
	return state;
}

function updateLeftUserScore(state, payload) {
	state.leftUserScore = payload.leftUserScore;
	return state;
}

function updateRightUserScore(state, payload) {
	state.rightUserScore = payload.rightUserScore;
	return state;
}

// game end

function setEndReason(state, payload) {
	state.endReason = payload.endReason;
	return state;
}

function setWinner(state, payload) {
	state.winner = payload.winner;
	return state;
}

export default {
	// login
	logIn,
	logOut,
	setIntraId,
	//main
	setLanguage,
	setGameMode,
	setFancyBall,
	// set game status
	setGameStatus,
	// at game start
	setSocket,
	setGameInfo,
	// real-time update
	updateBallPosition,
	updateLeftPaddlePosition,
	updateRightPaddlePosition,
	updateLeftUserScore,
	updateRightUserScore,
	// at game end
	setEndReason,
	setWinner,
};
