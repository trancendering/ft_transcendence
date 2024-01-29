import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { Side } from "../../../../enum/constant.js";
import {
    tableHeight,
} from "./config/sizeConfig.js";
import helvetiker_regular from "../../../../static/fonts/helvetiker_regular.typeface.json";

export default function createScoreObject(score, side) {
    const loader = new FontLoader();
    let scoreObject = new THREE.Group();

    loader.load(helvetiker_regular, function (font) {
        const geometry = new TextGeometry(score.toString(), {
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
        const text = new THREE.Mesh(geometry, material);

        text.geometry.computeBoundingBox();
        const textSize = text.geometry.boundingBox.getSize(new THREE.Vector3());
        const scoreSpacing = 0.5;

        if (side === Side.LEFT) {
            text.position.set(-scoreSpacing, tableHeight / 2 + 0.5, 0);
        } else if (side === Side.RIGHT) {
            text.position.set(scoreSpacing - textSize.x, tableHeight / 2 + 0.5, 0);
        }

        scoreObject.add(text);
    });

    return scoreObject;
}