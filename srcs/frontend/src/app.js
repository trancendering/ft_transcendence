import router, { navigateTo } from "./views/utils/router.js";
import store from "./store/index.js";
import "./static/scss/styles.scss";
import "./static/css/styles.css";
import "./static/css/tournamentBracketStyle.css";
import "bootstrap";

window.addEventListener("popstate", (event) => {
	console.log("popstat: window.location.pathname=", window.location.pathname);

	if (store.state.gameStatus === "playing" || store.state.round < 4) {
		event.preventDefault();
		console.log("leave game");
		store.dispatch("leaveGame");
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

document.addEventListener("DOMContentLoaded", async () => {
	setupNavigation();

	if (!store.state.isLoggedIn) {
		try {
			await checkLoginStatus();
		} catch (error) {
			console.error(error);
			navigateTo("/login");
			return;
		}
	}

	handleInitialRoute();
});

function setupNavigation() {
	document.body.addEventListener("click", (event) => {
		const targetElement = event.target.closest("[data-link]");

		if (targetElement) {
			event.preventDefault();
			navigateTo(targetElement.getAttribute("href"));
		}
	});
}

async function setUserInfo() {
	const response = await fetch("/api/v1/user", {
		method: "GET",
		credentials: "include",
	});

	const data = await response.json();

	store.dispatch("setIntraId", { intraId: data.intraId });
	store.dispatch("setLanguage", { languageId: data.preferred_language });
}

async function checkLoginStatus() {
	const response = await fetch("/api/v1/check-login", {
		credentials: "include",
	});

	const data = await response.json();

	if (data.isLoggedIn) {
		store.dispatch("logIn");
		await setUserInfo();
		navigateTo("/");
		console.log("login state: redirect to /");
	} else {
		throw new Error("Not logged in");
	}
}

function handleInitialRoute() {
	if (
		!store.state.gameStatus === "playing" &&
		["/game", "/tournament"].includes(window.location.pathname)
	) {
		navigateTo("/");
	} else {
		router();
	}
}
