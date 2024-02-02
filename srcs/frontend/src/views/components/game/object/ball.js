import * as THREE from "three";
import { ballRadius } from "./config/sizeConfig.js";

function createBallObject(fancyBall) {
	let ballColor = 0xffd700; // Default color
	let ballMaterial;
	let pointLight;

	const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);

	if (fancyBall === "fancy") {
		ballColor = 0x00ff00; // Fancy color

		ballMaterial = new THREE.MeshPhongMaterial({
			color: ballColor,
			emissive: ballColor,
			emissiveIntensity: 0.5,
			transparent: true,
			opacity: 0.8,
		});

		pointLight = new THREE.PointLight(ballColor, 1, 100);
		pointLight.position.set(0, 0, ballRadius);
	} else {
		// Non-fancy ball material
		ballMaterial = new THREE.MeshPhongMaterial({ color: ballColor });
	}

	const ball = new THREE.Mesh(ballGeometry, ballMaterial);
	ball.position.set(0, 0, ballRadius);

	return { ball, ...(fancyBall === "fancy" ? { pointLight } : {}) };
}

// function createBallObject(fancyBall) {
// 	let ballColor = 0xffd700;
// 	if (fancyBall === "fancy") {
// 		ballColor = 0x00ff00;
// 	}

// 	const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
// 	const ballMaterial = new THREE.MeshPhongMaterial({ color: ballColor });
// 	const ball = new THREE.Mesh(ballGeometry, ballMaterial);

// 	ball.position.set(0, 0, ballRadius);

// 	return ball;
// }

export { createBallObject };
