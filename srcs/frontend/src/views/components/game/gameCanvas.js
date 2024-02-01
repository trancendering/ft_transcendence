import store from "../../../store/index.js";
import Component from "../../../library/component.js";
import { Side } from "../../../enum/constant.js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import TWEEN from "@tweenjs/tween.js";
import { table } from "./object/table.js";
import { northWall, southWall, eastWall, westWall } from "./object/wall.js";
import { ball } from "./object/ball.js";
import { leftPaddle, rightPaddle } from "./object/paddle.js";
import createNicknameObject from "./object/nickname.js";
import createScoreObject from "./object/score.js";
import { scoreSeparator } from "./object/scoreSeperator.js";

export default class gameCanvas extends Component {
	constructor(params) {
		super({
			store,
			element: document.getElementById("gameCanvas"),
		});
		store.events.subscribe("gameStatusChange", async () => this.render());
		store.events.subscribe("leftUserScoreChange", async () =>
			this.updateLeftUserScore()
		);
		store.events.subscribe("rightUserScoreChange", async () =>
			this.updateRightUserScore()
		);
	}

	initRenderer() {
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.element,
			antialias: true,
		});
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	initCamera() {
		this.camera = new THREE.PerspectiveCamera(
			100,
			window.innerWidth / window.innerHeight,
			1,
			1000
		);
	}

	initScene() {
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color("#065535");

		const leftNicknameObject = createNicknameObject(
			store.state.gameContext,
			Side.LEFT
		);
		const rightNicknameObject = createNicknameObject(
			store.state.gameContext,
			Side.RIGHT
		);

		this.leftScoreObject = createScoreObject(
			store.state.leftUserScore,
			Side.LEFT
		);
		this.rightScoreObject = createScoreObject(
			store.state.rightUserScore,
			Side.RIGHT
		);

		this.scene.add(
			table,
			northWall,
			southWall,
			eastWall,
			westWall,
			ball,
			leftPaddle,
			rightPaddle,
			leftNicknameObject,
			rightNicknameObject,
			scoreSeparator,
			this.leftScoreObject,
			this.rightScoreObject
		);
	}

	initLighting() {
		const ambient = new THREE.AmbientLight(0xa0a0fc, 0.82);
		const sunLight = new THREE.DirectionalLight(0xe8c37b, 1.96);
		sunLight.position.set(-15, 40, 80);
		this.scene.add(ambient, sunLight);
	}

	initControls() {
		this.controls = new OrbitControls(
			this.camera,
			this.renderer.domElement
		);
	}

	setOrbitControlsLimits() {
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.04;
		this.controls.minDistance = 1;
		this.controls.maxDistance = 100;
		this.controls.enableRotate = true;
		this.controls.enableZoom = true;
		this.controls.maxPolarAngle = Math.PI;
		this.controls.minAzimuthAngle = -Math.PI / 2;
		this.controls.maxAzimuthAngle = Math.PI / 2;
	}

	introAnimation() {
		this.controls.enabled = false;

		const cameraTween = new TWEEN.Tween(
			this.camera.position.set(30, 30, -25)
		)
			.to({ x: 0, y: 0, z: 3.5 }, 3500)
			.delay(1000)
			.easing(TWEEN.Easing.Quartic.InOut)
			.start();

		cameraTween.onComplete(() => {
			if (store.state.gameStatus !== "ended") {
				store.dispatch("emitUserReadyEvent");
			}
			this.controls.enabled = true;
			this.setOrbitControlsLimits();
			TWEEN.remove(cameraTween);
		});
	}

	gameLoop() {
		leftPaddle.position.y = store.state.leftPaddlePosition / 100;
		rightPaddle.position.y = store.state.rightPaddlePosition / 100;

		ball.position.x = store.state.ballPosition.x / 100;
		ball.position.y = store.state.ballPosition.y / 100;

		TWEEN.update();
		this.controls.update();
		this.renderer.render(this.scene, this.camera);
		requestAnimationFrame(() => this.gameLoop());
	}

	async render() {
		this.element = document.getElementById("gameCanvas");

		if (store.state.gameStatus !== "playing") return;
		this.initRenderer();
		this.initCamera();
		this.initScene();
		this.initLighting();
		this.initControls();
		this.introAnimation();
		this.gameLoop();
		this.handleEvent();
		this.handleResize();
	}

	async handleEvent() {
		document.addEventListener("keydown", (e) => {
			if (store.state.gameStatus !== "playing") return;
			if (store.state.gameContext.participated === false) return;
			if (e.key == "ArrowUp") {
				store.dispatch("moveUserPaddleUp");
			} else if (e.key == "ArrowDown") {
				store.dispatch("moveUserPaddleDown");
			}
		});
	}

	async handleResize() {
		window.addEventListener(
			"resize",
			() => {
				// Update camera aspect ratio
				this.camera.aspect = window.innerWidth / window.innerHeight;
				this.camera.updateProjectionMatrix();

				this.renderer.setSize(window.innerWidth, window.innerHeight);
				this.renderer.setPixelRatio(
					Math.min(window.devicePixelRatio, 2)
				);
			},
			false
		);
	}

	async updateLeftUserScore() {
		if (store.state.gameStatus !== "playing") return;
		this.scene.remove(this.leftScoreObject);
		this.leftScoreObject = createScoreObject(
			store.state.leftUserScore,
			Side.LEFT
		);
		this.scene.add(this.leftScoreObject);
	}

	async updateRightUserScore() {
		if (store.state.gameStatus !== "playing") return;
		this.scene.remove(this.rightScoreObject);
		this.rightScoreObject = createScoreObject(
			store.state.rightUserScore,
			Side.RIGHT
		);
		this.scene.add(this.rightScoreObject);
	}
}
