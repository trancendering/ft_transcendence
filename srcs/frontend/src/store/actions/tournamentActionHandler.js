import GameActionHandler from "./gameActionHandler.js";
import { navigateTo } from "../../views/utils/router.js";
import { Side } from "../../enum/constant.js";

/**
 * @class tournamentActionHandler
 * @description tournament 게임 관련 액션을 처리하는 클래스
 */
export default class tournamentActionHandler extends GameActionHandler {
	static instance = null;

	constructor(context) {
		super(context);
		if (tournamentActionHandler.instance) {
			return tournamentActionHandler.instance;
		}
		tournamentActionHandler.instance = this;
	}

	static getInstance(context) {
		console.log("getInstance of tournamentActionHandler");
		if (!tournamentActionHandler.instance) {
			tournamentActionHandler.instance = new tournamentActionHandler(
				context
			);
		}
		return tournamentActionHandler.instance;
	}

	/**
	 * @description fullUserEvent 수신 후, tournament 모드 게임 시작 시 호출되는 함수.
	 * @param {object} payload { roomName, intraId, nickname}
	 */
	async startGame(payload) {
		console.log("EVENT: userFullEvent: tournamentActionHandler.startGame");
		const state = this.context.state;

		// 게임 시작 시 게임 정보 초기화
		this.roomName = payload.roomName;
		this.intraIdList = payload.intraId;
		this.nicknameList = payload.nickname;
		this.userIndex = this.intraIdList.indexOf(state.intraId);
		this.userSide = this.userIndex % 2 === 0 ? Side.LEFT : Side.RIGHT;
		this.matchQueue = [0, 1, 2, 3];
		this.initScores();
		this.initPositions();
		this.initTournamentPlayers();
		this.initTournamentScores();
		this.initTournamentWinners();
		this.updateGameContext();

		// 게임 페이지로 이동
		navigateTo("/tournament");
		this.context.commit("setRound", { round: 1 });
	}

	/**
	 * @description tournamentBracketModal이 뜬 이후, 매 라운드 시작 시 호출되는 함수.
	 */
	async startRound() {
		this.initScores();
		this.initPositions();
		await this.updateGameContext();
		this.context.commit("setGameStatus", { gameStatus: "playing" });
	}

	/**
	 * @description round 끝날 때마다 호출되는 함수.
	 *              다만, round가 마지막 라운드일 경우에는 호출되지 않는다.
	 * @param {object} payload {round, reason, winnerSide}
	 */
	async endRound(payload) {
		const state = this.context.state;
		console.log("EVENT: endGame: tournamentActionHandler.endRound");

		this.context.commit("updateTournamentScore", {
			round: payload.round,
			leftUserScore: state.leftUserScore,
			rightUserScore: state.rightUserScore,
		});

		const winnerIndex =
			this.matchQueue[payload.winnerSide === Side.LEFT ? 0 : 1];
		this.matchQueue = this.matchQueue.slice(2);
		console.log("this.matchQueue: ", this.matchQueue);
		this.matchQueue.push(winnerIndex);
		this.context.commit("updateTournamentWinner", {
			round: payload.round,
			winner: this.nicknameList[winnerIndex],
		});

		// 다음 round 번호 설정 -> Tournament Bracket Modal이 뜸
		this.context.commit("setRound", { round: payload.round + 1 });
	}

	/**
	 * @description endGame 이벤트를 수신할 때, 즉 round가 끝나거나 비정상적으로
	 *              게임이 종료하는 경우 호출되는 함수.
	 * @param {object} payload {round, reason, winnerSide}
	 */
	async endGame(payload) {
		console.log("EVENT: endGame: tournamentActionHandler.endGame");
		console.log(" round: ", payload.round, " reason: ", payload.reason);
		console.log(" winnerSide: ", payload.winnerSide);
		const state = this.context.state;

		if (payload.reason === "normal") {
			this.endRound(payload);
			if (payload.round < 3) {
				return;
			}
			this.context.commit("setWinner", {
				winner: state.tournamentWinner.round3,
			});
		}
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}
		this.context.commit("setEndReason", { endReason: payload.reason });
		if (state.endReason === "opponentLeft" || state.endReason === "userLeft") {
			this.context.commit("setGameStatus", { gameStatus: "ended" });
		}
	}

	/**
	 * @description tournament 참여자의 닉네임을 리스트 형태로 tournamentPlayer에 저장
	 */
	async initTournamentPlayers() {
		this.context.commit("setTournamentPlayer", {
			tournamentPlayer: this.nicknameList,
		});
	}

	/**
	 * @description round별로 tournament 참여자의 점수를 초기화
	 */
	async initTournamentScores() {
		this.context.commit("setTournamentScore", {
			tournamentScore: {
				round1: ["-", "-"],
				round2: ["-", "-"],
				round3: ["-", "-"],
			},
		});
	}

	/**
	 * @description round별로 tournament 참여자의 우승자를 초기화
	 */
	async initTournamentWinners() {
		this.context.commit("setTournamentWinner", {
			tournamentWinner: {
				round1: "-",
				round2: "-",
				round3: "-",
			},
		});
	}
}
