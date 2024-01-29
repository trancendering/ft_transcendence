import GameActionHandler from "./gameActionHandler.js";
import { navigateTo } from "../../views/utils/router.js";
import { Side } from "../../enum/constant.js";

/**
 * @class singleGameActionHandler
 * @description single 게임 관련 액션을 처리하는 클래스
 */
export default class singleGameActionHandler extends GameActionHandler {
	static instance = null;

	constructor(context) {
		super(context);
		if (singleGameActionHandler.instance) {
			return singleGameActionHandler.instance;
		}
		singleGameActionHandler.instance = this;
	}

	static getInstance(context, payload) {
		if (!singleGameActionHandler.instance) {
			singleGameActionHandler.instance = new singleGameActionHandler(
				context
			);
		}
		return singleGameActionHandler.instance;
	}

/**
 * @description fullUserEvent 수신 후, single 모드 게임 시작 시 호출되는 함수.
 * @param {object} payload { namespace, intraId, nickname, speedUp}
 */
	async startGame(payload) {
		console.log("EVENT: userFullEvent: singleGameActionHandler.startGame");
		const state = this.context.state;

		// 게임 시작 시 게임 정보 초기화
		this.roomName = payload.roomName;
		this.intraIdList = payload.intraId;
		this.nicknameList = payload.nickname;
		this.userIndex = this.intraIdList.indexOf(state.intraId);
		this.userSide = this.userIndex % 2 === 0 ? Side.LEFT : Side.RIGHT;
		this.matchQueue = [0, 1];
		this.initScores();
		this.initPositions();
		this.updateGameContext();

		console.log("EVENT: userFullEvent: startGame");
		console.log("  roomName=", payload.roomName);
		console.log("  intraId=", payload.intraId);
		console.log("  nickname=", payload.nickname);
		console.log("  userIndex=", this.userIndex);
		console.log("  userSide=", this.userSide);

		// 게임 페이지로 이동
		navigateTo("/game");
		this.context.commit("setGameStatus", { gameStatus: "playing" });
	}

	/**
	 * @description single 게임 모드에서 userFullEvent 발생 시 호출되는 함수.
	 * @param {object} payload {reason}
	 */
	async endGame(payload) {
		console.log("EVENT: endGame: singleGameActionHandler.endGame");
		const state = this.context.state;

		if (payload.reason === "normal") {
			const winner =
				state.leftUserScore > state.rightUserScore
					? state.gameContext.leftUser
					: state.gameContext.rightUser;
			this.context.commit("setWinner", { winner: winner });
		}

		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}
		this.context.commit("setEndReason", { endReason: payload.reason });
		this.context.commit("setGameStatus", { gameStatus: "ended" });
	}
}
