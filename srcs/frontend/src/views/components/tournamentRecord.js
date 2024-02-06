import store from "../../store/index.js";
import Component from "../../library/component.js";
import { tournamentRecord } from "../utils/languagePack.js";
import LanguageSelector from "./main/languageSelector.js";
import mainButton from "./record/mainButton.js";

export default class TournamentRecord extends Component {
	constructor() {
		super({ element: document.getElementById("app") });
		this.render();
		this.components = {
			languageSelector: new LanguageSelector(),
			mainButton: new mainButton(),
		};
		this.tournamentLogData = "";
		this.tournamentData = "";
		this.tournamentList = document.getElementById("tournamentList");
	}

	async render() {
		//console.log("render tournament page");

		const languageId = store.state.languageId;
		const view = /*html*/ `

			<!-- Navbar -->
			<nav class="navbar navbar-light bg-light">
			<form class="form-inline">
					<!-- Language Dropdown -->
					<div id="languageSelector"></div>

					<!-- Tournament Record -->
					<div id="mainBtn"></div>
				</form>
			</nav>

            <div class="container mt-5">
                <row>
				<div id="etherscan" class="col-md-12 mb-5 mt-4 d-flex align-items-center justify-content-center")">
					<h1>${tournamentRecord[languageId].title}</h1>
				</div>
                </row>
                <ul id="tournamentList" class="list-group">
                    <!-- Tournament data will be appended here -->
                </ul>
            </div>
        `;

		this.element.innerHTML = view;
		this.tournamentList = document.getElementById("tournamentList");
		this.getTournamentLog();
	}

	async getTournamentLog() {
		await fetch("/tournament/log")
			.then((response) => response.json())
			.then((data) => {
				//console.log(data);
				this.tournamentLogData = data;
				this.populateTournamentList();
			});
	}

	async populateTournamentList() {
		const languageId = store.state.languageId;
		// Clear any existing content
		// Parse the tournament log data and get the tournament list container
		try {
			let tournamentLogData = this.tournamentLogData;
			let tournamentData = this.tournamentData;
			let tournamentList = this.tournamentList;

			tournamentData = JSON.parse(tournamentLogData);

			this.renderLogComponent(tournamentData);

			const latestTournament = tournamentData.tournamentLog.reverse();
			latestTournament.forEach((tournamentData, index) => {
				const tournamentItem = document.createElement("li");
				tournamentItem.className = "list-group-item shadow mt-4 border rounded";

				// Unix timestamp to formatted date
				const unix_timestamp = tournamentData.tournament[3].timestamp;
				const formattedDate = this.createFormattedDate(unix_timestamp);

				tournamentItem.innerHTML = `
				<table style="width:100%">
					<tr>
						<th style-"text-align: letf;">Tournament ${index + 1}</th>
						<th style="text-align: right">Time: ${formattedDate}</th>
						</tr>
				</table>`;

				// check if there are games in the tournament
				if (tournamentData.tournament.length > 0) {
					const gameList = document.createElement("ul");
					gameList.className = "list-group ";
					for (const [gameIndex, game] of tournamentData.tournament.entries()) {
						if (gameIndex === 3) {
							break;
						}

						const gameItem = this.createGameItem(game, gameIndex);
						gameList.appendChild(gameItem);
					}
					tournamentItem.appendChild(gameList);
				} else {
					tournamentItem.innerHTML += `<p>${tournamentRecord[languageId].noGame}.</p>`;
				}
				tournamentList.appendChild(tournamentItem);
			});
		} catch (error) {
			//console.error("Error parsing tournament data: ", error);
		}
	}

	createGameItem(game, gameIndex) {
		const languageId = store.state.languageId;
		const gameItem = document.createElement("li");

		gameItem.className = "list-group-item";
		if (gameIndex === 2) {
			// gameItem.classList.add('bg-secondary');
			gameItem.classList.add("text-primary"); // Bootstrap 클래스를 사용하여 배경색 변경
		}
		const winnerTemplate = /*html*/ `
		<div class="row">
			<div class="col-md-6">
				<strong>${tournamentRecord[languageId].winner}:</strong>
				<span class="name">${game.winner.name}</span>
			</div>
			<div class="col-md-6">
				<strong>${tournamentRecord[languageId].score}:</strong>
				<span class="score">${game.winner.score}</span>
			</div>
		</div>`;
		const loserTemplate = /*html*/ `
		<div class="row">
			<div class="col-md-6">
				<strong>${tournamentRecord[languageId].loser}:</strong>
				<span class="name">${game.loser.name}</span>
			</div>
			<div class="col-md-6">
				<strong>${tournamentRecord[languageId].score}:</strong>
				<span class="score">${game.loser.score}</span>
			</div>
		</div>`;

		gameItem.innerHTML = /*html*/ `
            <div class="game-item">
                <div class="text-start game-id">${tournamentRecord[languageId].gameId} ${game.game_id}</div>
                <div class="text-start winner">${winnerTemplate}</div>
                <div class="text-start loser">${loserTemplate}</div>
            </div>
          `;

		return gameItem;
	}

	renderLogComponent(tournamentData) {
		const languageId = store.state.languageId;

		const newComponent = document.createElement("div");
		newComponent.id = "etherscan";
		newComponent.className =
			"btn btn-outline-dark shadow col-md-12 mb-5 mt-4 d-flex align-items-center justify-content-center";
		newComponent.innerHTML = `<h1>${tournamentRecord[languageId].title}</h1>`;

		// Add click event to open window
		const link = tournamentData.etherscan;
		newComponent.onclick = function () {
			try {
				window.open(link, "_blank");
			} catch (error) {
				//console.error("Failed to open window:", error);
			}
		};

		const originalComponent = document.getElementById("etherscan");
		if (originalComponent) {
			try {
				originalComponent.parentNode.replaceChild(newComponent, originalComponent);
			} catch (error) {
				//console.error("Failed to replace component:", error);
			}
		} else {
			//console.error("Original component not found.");
		}
	}

	createFormattedDate(unix_timestamp) {
		const date = new Date(unix_timestamp * 1000); // timestamp는 초 단위이므로 1000을 곱해 밀리초로 변환
		const formattedDate = new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			timeZone: "Asia/Seoul",
		}).format(date);
		return formattedDate;
	}
}
