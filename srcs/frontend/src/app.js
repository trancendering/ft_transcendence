import router, { navigateTo } from "./views/utils/router.js";
import store from "./store/index.js";
import "./static/scss/styles.scss";
import "./static/css/styles.css";
import "./static/css/tournamentBracketStyle.css";
import "bootstrap";

window.addEventListener("popstate", (event) => {
	console.log("popstat: window.location.pathname=", window.location.pathname);

	if (store.state.gameStatus === "playing") {
		event.preventDefault();
		console.log("leave game");
		store.dispatch("leaveGame");
		return;
	}
	if (
		window.location.pathname === "/game" ||
		window.location.pathname === "/tournament"
	) {
		event.preventDefault();
		console.log("can't go back to game or tournament page");
		navigateTo("/");
		return;
	}

	// Route to new page
	router();
});

document.addEventListener("DOMContentLoaded", () => {
	if (!store.state.isLoggedIn) {
		fetch("/api/v1/check-login", { credentials: "include" })
			.then((response) => {
				if (response.redirected) {
					throw new Error("Not logged in");
				} else {
					return response.json();
				}
			})
			.then((data) => {
				if (data.isLoggedIn) {
					store.dispatch("logIn");
					navigateTo("/");
					console.log("login state: redirect to /");
				} else {
					navigateTo("/login");
					console.log("logout state: redirect to login");
				}
			})
			.catch((error) => {
				console.log(error);
				navigateTo("/login");
				console.log("logout state: redirect to login");
			});
	} else {
		document.body.addEventListener("click", (event) => {
			const targetElement = event.target.closest("[data-link]");

			if (targetElement) {
				event.preventDefault();
				navigateTo(targetElement.href);
			}
		});

		if (
			store.state.gameStatus !== "playing" &&
			(window.location.pathname === "/game" ||
				window.location.pathname === "/tournament")
		) {
			navigateTo("/");
		} else {
			router();
		}
	}
});