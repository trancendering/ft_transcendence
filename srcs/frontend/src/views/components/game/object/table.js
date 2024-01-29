import * as THREE from 'three';
import {tableWidth, tableHeight} from "./config/sizeConfig";

const tableGeometry = new THREE.PlaneGeometry(tableWidth, tableHeight);
const tableMaterial = new THREE.MeshPhongMaterial({color: 0x000080, side: THREE.DoubleSide});

const table = new THREE.Mesh(tableGeometry, tableMaterial);

export {table};
