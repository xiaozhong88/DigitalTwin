import { TextureLoader, MeshPhongMaterial, Vector3, Matrix4, Mesh, Box3 } from 'three';
import { PLYLoader } from 'three/addons/loaders/PLYLoader';
import { DRACOLoader } from "three/addons/loaders/DRACOLoader";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
import rockImg from '../../assets/images/rocktexture.png';
import pebbleImg from '../../assets/images/Pebbletexture.png';

export function loadRock(m, scene, pos) {

    // var rockMesh;
    var rockTexture = new TextureLoader().load(rockImg);
    var pebbleTexture = new TextureLoader().load(pebbleImg);

    var rockMaterial = new MeshPhongMaterial();
    rockMaterial.map = rockTexture;

    var pebbleMaterial = new MeshPhongMaterial();
    pebbleMaterial.map = pebbleTexture;

    const rockMesh = m;

    // rock(scene, pos, rockMesh, rockMaterial);
}

export function rock(scene, pos, rockMesh) {

    var bbox = new Box3().setFromObject(rockMesh);
    // 变量以调整并重新定位网格位置
    var center = new Vector3();
    var size = new Vector3();
    bbox.getCenter(center);
    bbox.getSize(size);
    // mesh.rotateX(Math.PI / 2);
    // 缩放个平移矩阵
    var sca = new Matrix4();
    var tra = new Matrix4();
    // 应用变换和缩放变量到矩阵
    const scaleFact = (5 + Math.random() * 1);
    sca.makeScale(scaleFact, scaleFact, scaleFact);
    tra.makeTranslation(-center.x, -center.y, -bbox.min.z);
    // 应用矩阵到网格
    rockMesh.applyMatrix4(tra);
    rockMesh.applyMatrix4(sca);
    // 使鱼网格面向 X 轴
    // mesh.rotation.x = Math.PI / 2;
    // 将网格放置到位置
    rockMesh.position.set(pos.x, pos.y, pos.z);
    rockMesh.rotation.x = -Math.PI / 2;
    // mesh.rotation.z = -Math.PI / 2;

    scene.add(rockMesh);
}

function randModifier() {
    var randNum = Math.floor(Math.random()) + 1;
    randNum *= Math.round(Math.random()) ? 1 : -1;
    return randNum;
}

function randDir() {
    return (Math.random() - 0.5) * Math.PI;
}