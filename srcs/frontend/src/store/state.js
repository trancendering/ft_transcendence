export default {
	intraId: "intraId(hyeyukim)",
	isLoggedIn: false,
	languageId: "en",

	// Game Option
	gameMode: "Single", // or "Tournament"
	fancyBall: "fancy", // or "normal"

	// 공통 게임 정보: 게임이 종료되었을 때 업데이트
	endReason: "normal", // or "opponentLeft" or "userLeft"
	winner: null, // 최근 라운드 우승자의 nickname
	// 공통 게임 정보: 게임이 시작되거나 종료되었을 때 업데이트
	gameStatus: "ended", // or "playing"
	gameContext: {
		roomName: "",
		leftUser: "-", // nickname
		rightUser: "-", // nickname
		participated: false, // 본인 참석 여부
		userSide: "left", // 본인의 side
	},
	// 공통 게임 정보: 게임 도중 실시간으로 업데이트
	leftUserScore: 0,
	rightUserScore: 0,
	ballPosition: { x: 0, y: 0 },
	leftPaddlePosition: 200,
	rightPaddlePosition: 200,

	// tournament 정보
	round: 0,
	tournamentPlayers: ["", "", "", ""], // [player1_nickname, player2_nickname, player3_nickname, player4_nickname]
	tournamentScore: {
		round1: ["-", "-"], // [leftScore, rightScore]
		round2: ["-", "-"],
		round3: ["-", "-"],
	},
	tournamentWinner: {
		round1: "-", // nickname
		round2: "-",
		round3: "-",
	},
};
