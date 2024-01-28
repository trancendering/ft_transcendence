// router.js
import Main from "../components/main.js";
import Login from "../components/login.js";
import Game from "../components/game.js";

const routes = [
    {path: "/", view: Main},
    {path: "/login", view: Login},
    {path: "/game", view: Game},
];

const viewCache = {};

const pathToRegex = (path) =>
    new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const navigateTo = (url) => {
    history.pushState(null, null, url);
    router();
};

const router = async () => {
    const potentialMatches = routes.map((route) => {
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path)),
        };
    });

    let match = potentialMatches.find(
        (potentialMatch) => potentialMatch.result !== null
    );

    if (!match) {
        match = {
            route: routes[0],
            result: [location.pathname],
        };
    }

    if (!viewCache[match.route.view]) {
        console.log("new view created");
        viewCache[match.route.view] = new match.route.view();
    } else {
        viewCache[match.route.view].renderAll();
    }
};

export {navigateTo};
export default router;
