import store from "../../store/index.js";
import Component from "../../library/component.js";
import TournamentRecordButton from "./record/tournamentRecordButton.js";
import LogoutButton from './main/logoutButton.js';
import LanguageSelector from "./main/languageSelector.js";
import GameModeCard from "./main/gameModeCard.js";
import GameCustomizationModal from "./main/gameCustomizationModal.js";
import OpponentWaitingModal from "./main/opponentWaitingModal.js";
import InvalidNicknameModal from "./main/invalidNicknameModal.js";
import { main } from "../utils/languagePack.js";

export default class Main extends Component {
	constructor() {
		super({ element: document.getElementById("app") });

		store.events.subscribe("languageIdChange", () => this.renderAll());

		this.render();
		this.components = {
			tournamentRecordButton: new TournamentRecordButton(),
			logoutButton: new LogoutButton(),
			languageSelector: new LanguageSelector(),
			gameModeCard1: new GameModeCard({
				id: "singleGameMode",
				gameMode: "Single",
			}),
			gameModeCard3: new GameModeCard({
				id: "tournamentGameMode",
				gameMode: "Tournament",
			}),
			gameCustomizationModal: new GameCustomizationModal(),
			opponentWaitingModal: new OpponentWaitingModal(),
			invalidNicknameModal: new InvalidNicknameModal(),
		};
	}

	async render() {
		const languageId = store.state.languageId;

		const view = /*html*/ `

		<!-- Navbar -->
		<nav class="navbar navbar-expand-md navbar-light bg-light justify-content-between">
			<ul class="navbar-nav mr-auto">
				<!-- Tournament Record -->
				<li class="nav-item" id="tournamentRecordBtn"></li>
				<!-- Logout Button -->
				<li class="nav-item" id="logoutBtn"></li>
			</ul>
			<!-- Language Dropdown -->
			<div id="languageSelector"></div>
		</nav>


            <main class="d-flex flex-column align-items-center justify-content-center vh-100">
                <!-- Game Mode Selection -->
                <div>
                    <div class="w-100 d-flex justify-content-center align-items-center py-2">
                        <h1 class="display-4 fw-bold">${main[languageId].title}</h1>
                    </div>
                    <div class="d-flex flex-row gap-3 mt-3 justify-content-center">
                        <div id="singleGameMode" class="rounded border bg-light text-dark shadow-sm col" data-v0-t="card"></div>
                        <!--
						<div id="doubleGameMode" class="rounded border bg-light text-dark shadow-sm w-25" data-v0-t="card"></div>
						-->
                        <div id="tournamentGameMode" class="rounded border bg-light text-dark shadow-sm col" data-v0-t="card"></div>
                        <!--
						<div id="aiGameMode" class="rounded border bg-light text-dark shadow-sm w-25" data-v0-t="card"></div>
						-->
                    </div>
                </div>

                <!-- Game Customization Modal -->
                <div id="gameCustomizationModal" class="custom-modal"></div>

                <!-- Waiting Opponent Modal -->
                <div id="opponentWaitingModal" class="custom-modal"></div>

                <!-- Invalid Nickname Modal -->
                <div id="invalidNicknameModal" class="custom-modal"></div>
            </main>
        `;

		this.element.innerHTML = view;
	}
}
