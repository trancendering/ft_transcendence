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
		console.log("cookie: ", document.cookie)
        const sessionId = document.cookie.split('; ').find(row => row.startsWith('sessionid='));

        // const cookies = document.cookie.split(';').map(cookie => cookie.trim());
        // const sessionCookie = cookies.find(cookie => cookie.startsWith('sessionid='));
        // const sessionId = sessionCookie ? sessionCookie.split('=')[1] : null;

		console.log("sessionid=", sessionId);
        if (sessionId) {
            store.dispatch("logIn");
			navigateto("/");
			console.log("login state: redirect to /");
			console.log("sessionid=", sessionid);
        } else {
            navigateto("/login");
			console.log("logout state: redirect to login");
			console.log("sessionid=", sessionid);
        }
        return;
    }

	// if (!store.state.isLoggedIn) {
	// 	fetch('/api/check-login', { credentials: 'include' })
	// 		.then(response => {
	// 			if (response.ok) {
	// 				return response.json();
	// 			} else {
	// 				throw new Error('Not logged in');
	// 			}
	// 		})
	// 		.then(data => {
	// 			if (data.isLoggedIn) {
	// 				store.dispatch("logIn");
	// 				navigateTo("/");
	// 				console.log("login state: redirect to /");
	// 			} else {
	// 				navigateTo("/login");
	// 				console.log("logout state: redirect to login");
	// 			}
	// 		})
	// 		.catch(error => {
	// 			console.log(error);
	// 			navigateTo("/login");
	// 			console.log("logout state: redirect to login");
	// 		});
	// }

	const urlParams = new URLSearchParams(window.location.search);
	const code = urlParams.get('code');

	if (window.location.pathname === "/oauth" && code) {
		fetch("http://localhost:8000/oauth?code=" + code, {
			method: "GET",
			credentials: "include",
		})
		.then(response => response.json())
		.then(data => {
			if (data.status === "success") {
				store.dispatch("logIn");
				// navigateTo("/");
				window.location.href = "/";
			} else {
				console.error(data);
			}
		})
		.catch(error => console.error(error));
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
