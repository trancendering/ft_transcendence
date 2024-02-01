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

// game common state
function setGameStatus(state, payload) {
	state.gameStatus = payload.gameStatus;
	return state;
}

function setGameContext(state, payload) {
	state.gameContext = payload.gameContext;
	return state;
}

function setEndReason(state, payload) {
	state.endReason = payload.endReason;
	return state;
}

// game common state : real-time update
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

// tournament state
function setRound(state, payload) {
	state.round = payload.round;
	return state;
}

function setTournamentPlayer(state, payload) {
	state.tournamentPlayer = payload.tournamentPlayer;
	return state;
}

function setTournamentScore(state, payload) {
	state.tournamentScore = payload.tournamentScore;
	return state;
}

function setTournamentWinner(state, payload) {
	state.tournamentWinner = payload.tournamentWinner;
	return state;
}

/**
 *
 * @param {object} state
 * @param {object} payload {round, leftUserScore, rightUserScore}
 * @returns
 */
function updateTournamentScore(state, payload) {
	const newTournamentScore = { ...state.tournamentScore };
	newTournamentScore[`round${payload.round}`] = [
		payload.leftUserScore,
		payload.rightUserScore,
	];
	state.tournamentScore = newTournamentScore;
	console.log("updateTournamentScore: ", state.tournamentScore);
	return state;
}

function updateTournamentWinner(state, payload) {
	const newTournamentWinner = { ...state.tournamentWinner };
	newTournamentWinner[`round${payload.round}`] = payload.winner;
	state.tournamentWinner = newTournamentWinner;
	console.log("updateTournamentWinner: ", state.tournamentWinner);
	return state;
}

// single game state
function setWinner(state, payload) {
	state.winner = payload.winner;
	return state;
}

export default {
	// login
	logIn,
	logOut,
	setIntraId,
	// main
	setLanguage,
	setGameMode,
	setFancyBall,
	// game common state
	setGameStatus,
	setGameContext,
	setEndReason,
	// game common state : real-time update
	updateBallPosition,
	updateLeftPaddlePosition,
	updateRightPaddlePosition,
	updateLeftUserScore,
	updateRightUserScore,
	// tournament state
	setRound,
	setTournamentPlayer,
	setTournamentScore,
	setTournamentWinner,
	updateTournamentScore,
	updateTournamentWinner,
	// single game state
	setWinner,
};
