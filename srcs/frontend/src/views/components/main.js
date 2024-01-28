import store from "../../store/index.js";
import Component from "../../library/component.js";
import LanguageSelector from "./main/languageSelector.js";
import GameModeCard from "./main/gameModeCard.js";
import GameCustomizationModal from "./main/gameCustomizationModal.js";
import OpponentWaitingModal from "./main/opponentWaitingModal.js";
import InvalidNicknameModal from "./main/invalidNicknameModal.js";
import { main } from "../utils/languagePack.js";

export default class Main extends Component {
	constructor(params) {
		super({
			store,
			element: document.getElementById("app"),
		});

		store.events.subscribe("languageIdChange", () => this.renderAll());

		this.render();
		this.components = {
			languageSelector: new LanguageSelector(),
			gameModeCard1: new GameModeCard({
				id: "single-game-mode",
				gameMode: "Single", //"1 VS 1",
			}),
			// gameModeCard2: new GameModeCard({
			// 	id: "double-game-mode",
			// 	gameMode: "2 VS 2",
			// }),
			gameModeCard3: new GameModeCard({
				id: "tournament-game-mode",
				gameMode: "Tournament",
			}),
			// gameModeCard4: new GameModeCard({
			// 	id: "ai-game-mode",
			// 	gameMode: "AI",
			// }),
			gameCustomizationModal: new GameCustomizationModal(),
			opponentWaitingModal: new OpponentWaitingModal(),
			invalidNicknameModal: new InvalidNicknameModal(),
		};
	}

	async render() {
		const languageId = store.state.languageId;

		const view = `
            <!-- Language Dropdown -->
            <div id="language-selector"></div>
                
            <main class="d-flex flex-column align-items-center justify-content-center vh-100">
                <!-- Game Mode Selection -->
                <div>
                    <div class="w-100 d-flex justify-content-center align-items-center py-2">
                        <h1 class="display-4 fw-bold">${main[languageId].title}</h1>
                    </div>
                    <div class="d-flex flex-row gap-3 mt-3 justify-content-center">
                        <div id="single-game-mode" class="rounded border bg-light text-dark shadow-sm col-md" data-v0-t="card"></div>
                        <!--
						<div id="double-game-mode" class="rounded border bg-light text-dark shadow-sm w-25" data-v0-t="card"></div>
						-->
                        <div id="tournament-game-mode" class="rounded border bg-light text-dark shadow-sm col-md" data-v0-t="card"></div>
                        <!--
						<div id="ai-game-mode" class="rounded border bg-light text-dark shadow-sm w-25" data-v0-t="card"></div>
						-->
                    </div>
                </div>
                
                <!-- Game Customization Modal -->
                <div id="game-customization-modal" class="modal fade" tabindex="-1" role="dialog" data-bs-backdrop="static" data-bs-keyboard="true"></div>
                
                <!-- Waiting Opponent Modal -->
                <div id="opponent-waiting-modal" class="modal fade" tabindex="-1" role="dialog" data-bs-backdrop="static" data-bs-keyboard="false"></div>
                
                <!-- Invalid Nickname Modal -->
                <div id="invalid-nickname-modal" class="modal fade" tabindex="-1" role="dialog" data-bs-backdrop="static" data-bs-keyboard="false"></div>
            </main>
        `;

		this.element.innerHTML = view;
	}
}
