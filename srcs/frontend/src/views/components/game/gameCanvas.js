import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import store from "../../../store/index.js";
import Component from "../../../library/component.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Side } from "../../../enum/constant.js";
import {
	table,
	northWall,
	southWall,
	eastWall,
	westWall,
	leftPaddle,
	rightPaddle,
	// scoreSeparator,
	createBallObject,
	// createNicknameObject,
	// createScoreObject,
} from "./object";

export default class gameCanvas extends Component {
	constructor() {
		super({ element: document.getElementById("gameCanvas") });
		store.events.subscribe("gameStatusChange", async () => this.render());
		// store.events.subscribe("leftUserScoreChange", async () => this.updateLeftUserScore());
		// store.events.subscribe("rightUserScoreChange", async () => this.updateRightUserScore());
		this.handleEvent();
		this.handleResize();
	}

	/**
	 * @description Renderer를 초기화
	 * 렌더러를 DOM에 추가 - gameCanvas
	 * 렌더러의 크기와 픽셀 비율을 설정
	 */
	initRenderer() {
		this.renderer = new THREE.WebGLRenderer({ canvas: this.element, antialias: true });
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	/**
	 * @description 카메라를 초기화
	 * 카메라의 fov, aspect, near, far를 설정
	 */
	initCamera() {
		this.camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 1000);
	}

	/**
	 * @description Scene을 초기화
	 * Scene에 필요한 객체들을 추가
	 */
	initScene() {
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color("#065535");

		// 객체들을 Scene에 추가하는 함수
		const addObjectsToScene = (objects) => objects.forEach((obj) => this.scene.add(obj));

		// 좌우 닉네임, 점수, 공 객체를 생성
		// const nicknameObjects = [
		// 	createNicknameObject(store.state.gameContext, Side.LEFT),
		// 	createNicknameObject(store.state.gameContext, Side.RIGHT),
		// ];
		// const scoreObjects = [
		// 	(this.leftScoreObject = createScoreObject(store.state.leftUserScore, Side.LEFT)),
		// 	(this.rightScoreObject = createScoreObject(store.state.rightUserScore, Side.RIGHT)),
		// ];
		const { ball, pointLight } = createBallObject(store.state.fancyBall);
		this.ball = ball;
		this.pointLight = pointLight;

		// 동적으로 Mesh가 변하지 않는 객체들
		const staticObjects = [
			table,
			northWall,
			southWall,
			eastWall,
			westWall,
			leftPaddle,
			rightPaddle,
			// scoreSeparator,
			this.ball,
		];

		// Scene에 객체들을 추가
		// addObjectsToScene([...staticObjects, ...nicknameObjects, ...scoreObjects]);
		addObjectsToScene([...staticObjects]);

		// fancyBall 모드의 경우에는 pointLight를 추가
		if (this.pointLight) {
			this.scene.add(this.pointLight);
		}
	}

	/**
	 * @description 조명을 초기화
	 * fancyBall 모드의 경우에는 조명의 강도를 낮춤
	 */
	initLighting() {
		const [ambientIntensity, sunLightIntensity] = store.state.fancyBall === "fancy" ? [0.5, 1.2] : [0.82, 1.96];

		const ambient = new THREE.AmbientLight(0xa0a0fc, ambientIntensity); // 환경광
		const sunLight = new THREE.DirectionalLight(0xe8c37b, sunLightIntensity); // 태양광

		sunLight.position.set(-15, 40, 80);

		this.scene.add(ambient, sunLight);
	}

	/**
	 * @description OrbitControls를 초기화
	 * 카메라의 이동, 줌, 회전을 제어
	 */
	initControls() {
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
	}

	/**
	 * @description OrbitControls의 제한을 설정
	 * 카메라의 이동, 줌, 회전의 제한을 설정
	 */
	setOrbitControlsLimits() {
		this.controls.enableDamping = true; // 부드러운 카메라 이동을 위해 활성화
		this.controls.dampingFactor = 0.04; // 부드러운 카메라 이동을 위한 감쇠 계수
		this.controls.minDistance = 1;
		this.controls.maxDistance = 100;
		this.controls.enableRotate = true;
		this.controls.enableZoom = true;
		this.controls.maxPolarAngle = Math.PI; // 카메라의 최대 위도 각도
		this.controls.minAzimuthAngle = -Math.PI / 2; // 카메라의 최소 방위각
		this.controls.maxAzimuthAngle = Math.PI / 2; // 카메라의 최대 방위각
	}

	/**
	 * @description 게임 시작 시 카메라의 초기 애니메이션
	 */
	introAnimation() {
		// 카메라의 이동을 제어하기 위해 OrbitControls를 잠시 비활성화
		this.controls.enabled = false;

		// 카메라의 초기 위치와 최종 위치를 설정
		const cameraTween = new TWEEN.Tween(this.camera.position.set(30, 30, -25))
			.to({ x: 0, y: 0, z: 3.5 }, 3500)
			.delay(1000)
			.easing(TWEEN.Easing.Quartic.InOut)
			.start();

		// 초기 애니메이션이 끝나면 사용자가 준비되었음을 서버에 알림
		cameraTween.onComplete(() => {
			if (store.state.gameStatus !== "ended") {
				store.dispatch("emitUserReadyEvent");
			}
			this.controls.enabled = true; // 카메라 이동을 다시 활성화
			this.setOrbitControlsLimits(); // 카메라 이동의 제한을 설정
			TWEEN.remove(cameraTween); // 카메라 애니메이션을 제거
		});
	}

	/**
	 * @description 패들과 공의 위치를 업데이트
	 */
	updatePositions() {
		// 패들 위치 업데이트
		leftPaddle.position.y = store.state.leftPaddlePosition / 100;
		rightPaddle.position.y = store.state.rightPaddlePosition / 100;

		// 공 위치 업데이트
		this.ball.position.x = store.state.ballPosition.x / 100;
		this.ball.position.y = store.state.ballPosition.y / 100;

		// fancyBall 모드의 경우에는 pointLight 위치 업데이트
		if (this.pointLight) {
			this.pointLight.position.x = this.ball.position.x;
			this.pointLight.position.y = this.ball.position.y;
		}
	};

	/**
	 * @description 게임 루프
	 * 게임의 상태를 업데이트하고 렌더링
	 */
	gameLoop() {
		// 패들과 공의 위치를 업데이트
		this.updatePositions();

		TWEEN.update();
		this.controls.update();
		this.renderer.render(this.scene, this.camera);

		// 다음 프레임을 요청, 게임이 종료되면 프레임 요청을 취소
		const frameId = requestAnimationFrame(() => this.gameLoop());
		if (store.state.gameStatus === "ended") {
			cancelAnimationFrame(frameId);
		}
	}

	/**
	 * @description 게임 렌더링
	 */
	async render() {
		if (store.state.gameStatus !== "playing") return;

		this.element = document.getElementById("gameCanvas");
		this.initRenderer();
		this.initCamera();
		this.initScene();
		this.initLighting();
		this.initControls();
		this.introAnimation();
		this.gameLoop();
	}

	/**
	 * @description 이벤트 핸들러
	 * 키보드 이벤트를 처리
	 */
	async handleEvent() {
		let canInput = true;
		document.addEventListener("keydown", (e) => {
			// 입력이 불가능한 경우 이벤트를 처리하지 않음
			if (canInput === false) return;

			// 게임이 종료되었으면 이벤트를 처리하지 않음
			if (store.state.gameStatus !== "playing") return;

			// 게임에 참여하지 않는 경우 이벤트를 처리하지 않음
			if (store.state.gameContext.participated === false) return;

			if (e.key == "ArrowUp") {
				store.dispatch("moveUserPaddleUp");
			} else if (e.key == "ArrowDown") {
				store.dispatch("moveUserPaddleDown");
			}

			canInput = false;
			setTimeout(() => canInput = true, 200);
		});
	}

	/**
	 * @description 창 크기 조절 이벤트 핸들러
	 * 창 크기가 조절될 때 카메라의 aspect와 renderer의 크기를 조절
	 */
	async handleResize() {
		window.addEventListener(
			"resize",
			() => {
				if (store.state.gameStatus !== "playing") return;

				this.camera.aspect = window.innerWidth / window.innerHeight;
				this.camera.updateProjectionMatrix();
				this.renderer.setSize(window.innerWidth, window.innerHeight);
				this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
			},
			false
		);
	}

	/**
	 * @description 왼쪽 사용자의 점수 Object를 업데이트
	 */
	// async updateLeftUserScore() {
	// 	if (store.state.gameStatus !== "playing") return;

	// 	this.scene.remove(this.leftScoreObject);
	// 	this.leftScoreObject = createScoreObject(store.state.leftUserScore, Side.LEFT);
	// 	this.scene.add(this.leftScoreObject);
	// }

	/**
	 * @description 오른쪽 사용자의 점수 Object를 업데이트
	 */
	// async updateRightUserScore() {
	// 	if (store.state.gameStatus !== "playing") return;

	// 	this.scene.remove(this.rightScoreObject);
	// 	this.rightScoreObject = createScoreObject(store.state.rightUserScore, Side.RIGHT);
	// 	this.scene.add(this.rightScoreObject);
	// }
}
