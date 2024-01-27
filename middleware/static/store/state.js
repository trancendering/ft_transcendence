export default {
	intraId: "intraId(hyeyukim)",
	isLoggedIn: false,
	languageId: "en",

	// Game Option
	gameMode: "Single", // or "Tournament"
	fancyBall: "fancy", // or "normal"

	// Real-time Game
	socket: null,
	// game Info
	gameInfo: {
		roomName: "",
		leftUser: "",
		rightUser: "",
		userSide: "left", // or "right"
	},
	// game status
	gameStatus: "ended", // or "playing" or "ended"
	endReason: "normal", // or "opponentLeft"
	leftUserScore: 0,
	rightUserScore: 0,
	ballPosition: { x: 0, y: 0 },
	leftPaddlePosition: 200,
	rightPaddlePosition: 200,
	// after game end
	winner: null,
	// before game start
	countDown: false,
};
