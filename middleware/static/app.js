import router, { navigateTo } from "./views/utils/router.js";
import store from "./store/index.js";

window.addEventListener("popstate", (event) => {
	console.log("popstat: window.location.pathname=", window.location.pathname);

	if (store.state.gameStatus === "playing") {
		event.preventDefault();
		console.log("leave game");
		store.dispatch("leaveGame");
		return;
	}
	if (window.location.pathname === "/game") {
		event.preventDefault();
		console.log("can't go back to game page");
		navigateTo("/");
		return;
	}

	// Route to new page
	router();
});

document.addEventListener("DOMContentLoaded", () => {
	document.body.addEventListener("click", (event) => {
		const targetElement = event.target.closest("[data-link]");

		if (targetElement) {
			event.preventDefault();
			navigateTo(targetElement.href);
		}
	});

    if (store.state.gameStatus !== "playing"
        && window.location.pathname === "/game") {
		navigateTo("/");
	} else {
		router();
	}
});
