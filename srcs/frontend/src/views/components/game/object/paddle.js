import * as THREE from 'three';
import {
    paddleWidth,
    paddleHeight,
    paddleDepth,
    tableWidth,
} from "./config/sizeConfig";

const paddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);
const paddleMaterial = new THREE.MeshPhongMaterial({color: 0xFF0000});

const leftPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
const rightPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);

leftPaddle.position.set(-tableWidth / 2 + paddleWidth / 2 + 0.1, 0, paddleDepth / 2);
rightPaddle.position.set(tableWidth / 2 - paddleWidth / 2 - 0.1, 0, paddleDepth / 2);

export {leftPaddle, rightPaddle};