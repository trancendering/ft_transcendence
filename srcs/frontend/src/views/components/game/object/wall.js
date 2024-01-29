import * as THREE from 'three';
import {
    horizontalWallWidth,
    horizontalWallHeight,
    horizontalWallDepth,
    verticalWallWidth,
    verticalWallHeight,
    verticalWallDepth,
    tableWidth,
    tableHeight
} from "./config/sizeConfig";

const horizontalWallGeometry = new THREE.BoxGeometry(horizontalWallWidth, horizontalWallHeight, horizontalWallDepth);
const verticalWallGeometry = new THREE.BoxGeometry(verticalWallWidth, verticalWallHeight, verticalWallDepth);
const wallMaterial = new THREE.MeshPhongMaterial({color: 0x666666});

const northWall = new THREE.Mesh(horizontalWallGeometry, wallMaterial);
const southWall = new THREE.Mesh(horizontalWallGeometry, wallMaterial);
const eastWall = new THREE.Mesh(verticalWallGeometry, wallMaterial);
const westWall = new THREE.Mesh(verticalWallGeometry, wallMaterial);

northWall.position.set(0, tableHeight / 2 + horizontalWallHeight / 2, horizontalWallDepth / 2);
southWall.position.set(0, -tableHeight / 2 - horizontalWallHeight / 2, horizontalWallDepth / 2);
eastWall.position.set(tableWidth / 2 + verticalWallWidth / 2, 0, verticalWallDepth / 2);
westWall.position.set(-tableWidth / 2 - verticalWallWidth / 2, 0, verticalWallDepth / 2);

export {northWall, southWall, eastWall, westWall};

