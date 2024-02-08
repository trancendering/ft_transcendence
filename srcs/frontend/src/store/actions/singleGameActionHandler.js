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
			singleGameActionHandler.instance = new singleGameActionHandler(context);
		}
		return singleGameActionHandler.instance;
	}

	/**
	 * @description fullUserEvent 수신 후, single 모드 게임 시작 시 호출되는 함수.
	 * @param {object} payload { namespace, intraId, nickname, speedUp}
	 */
	async startGame(payload) {
		//console.groupCollapsed("EVENT: userFullEvent: singleGameActionHandler.startGame");

		// 게임 시작 시 게임 정보 초기화
		this.roomName = payload.roomName;
		this.socketIdList = payload.socketId;
		this.intraIdList = payload.intraId;
		this.nicknameList = payload.nickname;
		this.userIndex = this.socketIdList.indexOf(this.socket.id);
		// this.userIndex = this.intraIdList.indexOf(state.intraId);
		this.userSide = this.userIndex % 2 === 0 ? Side.LEFT : Side.RIGHT;
		this.matchQueue = [0, 1];

		//console.log(" - roomName=", payload.roomName);
		//console.log(" - socketId=", payload.socketId);
		//console.log(" - intraId=", payload.intraId);
		//console.log(" - nickname=", payload.nickname);
		//console.log(" - userSocket=", this.socket.id);
		//console.log(" - userIndex=", this.userIndex);
		//console.log(" - userSide=", this.userSide);

		this.initScores();
		this.initPositions();
		this.updateGameContext();
		this.context.commit("setEndReason", { endReason: "normal" });

		// 게임 페이지로 이동
		navigateTo("/game");
		this.context.commit("setMusicOn", { musicOn: false });
		this.context.commit("setGameStatus", { gameStatus: "playing" });
		this.trackBallPosition();
		//console.groupEnd();
	}

	/**
	 * @description single 게임 모드에서 userFullEvent 발생 시 호출되는 함수.
	 * @param {object} payload {reason}
	 */
	async endGame(payload) {
		//console.groupCollapsed("EVENT: endGame: singleGameActionHandler.endGame");
		//console.log(" reason=", payload.reason);

		const state = this.context.state;

		// this.context.commit("setMusicOn", { musicOn: false });
		if (payload.reason === "normal") {
			const winner =
				state.leftUserScore > state.rightUserScore ? state.gameContext.leftUser : state.gameContext.rightUser;
			this.context.commit("setWinner", { winner: winner });
		}

		if (!this.gameEnded) {
			this.socket.disconnect();
			this.gameEnded = true;
		}
		this.context.commit("setEndReason", { endReason: payload.reason });
		this.context.commit("setGameStatus", { gameStatus: "ended" });
		//console.groupEnd();
	}
}
