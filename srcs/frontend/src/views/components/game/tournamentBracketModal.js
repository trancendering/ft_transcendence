import store from "../../../store/index.js";
import Component from "../../../library/component.js";
// import { tournamentBracketModal } from "../../utils/languagePack.js";

export default class TournamentBracketModal extends Component {
	constructor() {
		super({
			store,
			element: document.getElementById("tournamentBracketModal"),
		});
		this.render();
		store.events.subscribe("roundChange", () =>
			this.showTournamentBracketModal()
		);
	}

	async render() {
		// const languageId = store.state.languageId;
		console.log("render tournament bracket modal");
		const player = store.state.tournamentPlayer;
		const score = store.state.tournamentScore;
		const winner = store.state.tournamentWinner;

		console.log(player);
		console.log(score);
		console.log(winner);
		const view = /*html*/ `
        <div class="custom-modal-dialog">
            <div class="custom-modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="tournamentBracketModalLabel">Tournament Bracket</h1>
                </div>
                <div class="modal-body">
                    <div class="background bracket">
                        <div class="round one">
                            <div class="match">
                                <div class="match-top team">
                                    <span class="name">${player[0]}</span>
                                    <span class="score">${score.round1[0]}</span>
                                </div>
                                <div class="match-bottom team">
                                    <span class="name">${player[1]}</span>
                                    <span class="score">${score.round1[1]}</span>
                                </div>
                                <div class="match-lines">
                                    <div class="line one"></div>
                                    <div class="line two"></div>
                                </div>
                                <div class="match-lines alt">
                                    <div class="line one"></div>
                                </div>
                            </div>

                            <div class="match">
                                <div class="match-top team">
                                    <span class="name">${player[2]}</span>
                                    <span class="score">${score.round2[0]}</span>
                                </div>
                                <div class="match-bottom team">
                                    <span class="name">${player[3]}</span>
                                    <span class="score">${score.round2[1]}</span>
                                </div>
                                <div class="match-lines">
                                    <div class="line one"></div>
                                    <div class="line two"></div>
                                </div>
                                <div class="match-lines alt">
                                    <div class="line one"></div>
                                </div>
                            </div>
                        </div>

                        <div class="round two">
                            <div class="match">
                                <div class="match-top team">
                                    <span class="name">${winner.round1}</span>
                                    <span class="score">${score.round3[0]}</span>
                                </div>
                                <div class="match-bottom team">
                                    <span class="name">${winner.round2}</span>
                                    <span class="score">${score.round3[1]}</span>
                                </div>
                                <div class="match-lines">
                                    <div class="line one"></div>
                                </div>
                                <div class="match-lines alt">
                                    <div class="line one"></div>
                                </div>
                            </div>
                        </div>

                        <div class="round three">
                            <div class="champion">
                                <div>
                                    <span class="name">${winner.round3}</span>
                                </div>
                                <div class="match-lines alt">
                                    <div class="line one"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
		`;

		this.element = document.getElementById("tournamentBracketModal");
		this.element.innerHTML = view;
	}

	async showTournamentBracketModal() {
		console.log("show tournament bracket modal");

		this.render();

		// 2.5초 후에 모달을 닫는다
		const modal = document.getElementById("tournamentBracketModal");
		modal.style.display = "flex";
		await new Promise((resolve) => setTimeout(resolve, 2500));
		modal.style.display = "none";

		// 해당 라운드 게임을 시작한다
		if (store.state.round < 4) store.dispatch("startRound");
		else store.dispatch("setGameStatus", { gameStatus: "ended" });
	}
}
