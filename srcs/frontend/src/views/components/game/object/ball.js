import * as THREE from "three";
import { ballRadius } from "./config/sizeConfig.js";

const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 });

const ball = new THREE.Mesh(ballGeometry, ballMaterial);

ball.position.set(0, 0, ballRadius);

export { ball };
