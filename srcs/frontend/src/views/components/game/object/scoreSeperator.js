import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import {
    tableHeight,
} from "./config/sizeConfig.js";
import helvetiker_regular from "../../../../static/fonts/helvetiker_regular.typeface.json";

const loader = new FontLoader();
let scoreSeparator; // Define scoreSeparator in the outer scope

loader.load(helvetiker_regular, function (font) {
    const geometry = new TextGeometry('-', {
        font: font,
        size: 0.2,
        height: 0.1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.01,
        bevelOffset: 0,
        bevelSegments: 5
    });
    const material = new THREE.MeshPhongMaterial({color: 0xFFFFFF});
    scoreSeparator = new THREE.Mesh(geometry, material); // Create the THREE.Mesh object here

    scoreSeparator.geometry.computeBoundingBox();
    const textSize = scoreSeparator.geometry.boundingBox.getSize(new THREE.Vector3());

    scoreSeparator.position.set(-(textSize.x / 2), tableHeight / 2 + 0.5, 0);
});

export {scoreSeparator};