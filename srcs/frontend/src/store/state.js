export default {
	intraId: "intraId(hyeyukim)",
	isLoggedIn: false,
	languageId: "en",

	// Game Option
	gameMode: "Single", // or "Tournament"
	fancyBall: "fancy", // or "normal"

	// Real-time Game
	socket: null,
	// Game
	gameInfo: {
		roomName: "",
		intraId: [],
		nickname: [],
		userIndex: 0,
		userSide: 0,
	},
	// Game Status
	gameStatus: "ended", // or "playing" or "ended"
	// Real-time Updated Game State
	leftUserScore: 0,
	rightUserScore: 0,
	ballPosition: { x: 0, y: 0 },
	leftPaddlePosition: 200,
	rightPaddlePosition: 200,
	// At the End of Game
	endReason: "normal", // or "opponentLeft"
	winner: null,
};
