import { AxesHelper, DirectionalLight, AmbientLight, VideoTexture, PlaneGeometry, MeshBasicMaterial, DoubleSide, Mesh, Vector3, Matrix4, SplineCurve, LineBasicMaterial, BoxGeometry, Line, Quaternion, BufferGeometry, Clock, TextureLoader, ClampToEdgeWrapping, SRGBColorSpace, Color, Texture, RepeatWrapping } from "three";
import * as THREE from "three";
import { RGBELoader } from "three/addons/loaders/RGBELoader";
import { OrbitControls } from "three/addons/controls/OrbitControls";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
import { Reflector } from "three/addons/objects/Reflector";
import { scene } from "../Scene";
import * as TWEEN from '@tweenjs/tween.js';
import { GroupSettings, FishSchoolProperty, FishActivityRange } from "../build/models/groupSettings";
import { Octree } from "../build/octree/octree";
import { Box } from "../build/octree/box";
import { Group } from "../build/models/group";
import { smoothStep, smoothStepFlip, pointInPolygon } from "../utils/Math";
import { rock } from "./Rock";

const worldWidth = 1024, worldDepth = 1024;

// 模拟中所有活动主体的列表
var groups = [];
var MainProperties = {
    numGroups: 0,
    maxFish: 3500
};
// groups 八叉树，用于空间分区和 groups 邻居比较优化
// const octree = new Octree(
//     new Box(
//         -GroupSettings.worldSize, -GroupSettings.worldSize * 0.5, -GroupSettings.worldSize,
//         GroupSettings.worldSize * 2.0, GroupSettings.worldSize, GroupSettings.worldSize * 2.0
//     ), 10
// );
const octrees = Array.from({ length: 6 }, () => []);
export { groups, MainProperties, octrees };

export const videoMesh = new Mesh();
let feeders = []; // 保存所有投食器的引用
export const spheres = Array.from({ length: 6 }, () => []); // 保存所有球的引用
let spherePos = Array.from({ length: 6 }, () => []); // 保存所有球的位置
let isPredict = false; // 是否点击预测
export function setPredict(val) {
    isPredict = val;
}
const removalInterval = 1; // 时间间隔
export let lpPos = [];

export function Start() {
    // 添加世界坐标辅助器
    // const axesHelper = new AxesHelper(5);
    // scene.add(axesHelper);

    // 创建rgbe加载器
    // const hdrLoader = new RGBELoader();
    // hdrLoader.load("../../public/assets/sky12.hdr", (texture) => {
    //     texture.mapping = THREE.EquirectangularReflectionMapping;
    //     scene.background = texture;
    //     scene.environment = texture;
    // });

    // // 添加轨道控制器
    // const controls = new OrbitControls(staticCamera, renderer.domElement);
    // // 设置带阻尼的惯性
    // controls.enableDamping = true;
    // controls.update();

    const data = generateHeight(worldWidth, worldDepth);

    const geometry = new PlaneGeometry(2000, 2000, worldWidth - 1, worldDepth - 1);
    geometry.rotateX(-Math.PI / 2);

    const vertices = geometry.attributes.position.array;

    for (let i = 0, j = 0, l = vertices.length / 3; i < l; i++, j += 3) {
        vertices[j + 1] = data[i] * 10;
    }
    // 更新几何体的位置属性
    geometry.attributes.position.needsUpdate = true;

    // 有问题，设想一，二维数组，设想二，变化i位置
    // let k = worldWidth * worldDepth / 2;
    // let ov = 1;
    // for (let i = 0, sum = 0, j = 0, l = vertices.length; j < l; j += 3) {
    //     if (sum < 128) {
    //         vertices[j + 1] = data[i] * 10;
    //         i++;
    //         sum++;
    //     } else {
    //         sum = 0;
    //         if (ov === 1) {
    //             i += k;
    //             ov += 1;
    //         } else {
    //             i -= k;
    //             ov -= 1;
    //         }
    //         vertices[j + 1] = data[i] * 10;
    //         i++;
    //         sum++;
    //     }
    // }

    const texture = new TextureLoader().load('/assets/images/sand.png', function (texture) {
        texture.wrapS = ClampToEdgeWrapping;
        texture.wrapT = ClampToEdgeWrapping;
        texture.colorSpace = SRGBColorSpace;
    });
    const material = new MeshBasicMaterial({ side: DoubleSide, map: texture });

    const mesh = new Mesh(geometry, material);
    mesh.position.y = -100;

    // mesh.geometry.computeBoundingBox();
    scene.add(mesh);

    // 添加机器人
    // 设置解压缩的加载器
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/gltf/');
    dracoLoader.setDecoderConfig({ type: 'js' });

    const fishLoader = new GLTFLoader();
    fishLoader.setDRACOLoader(dracoLoader);
    fishLoader.load('/models/Fish.glb', (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
            if (child.isMesh) {
                child.frustumCulled = false;
                // 模型阴影
                child.castShadow = true;
                //模型自发光
                child.material.emissive = child.material.color;
                child.material.emissiveMap = child.material.map;
            }
        });
        for (let i = 0; i < 180; i++) {
            FishSchoolProperty.id = Math.floor(i / 10) % 6;
            let group = new Group(model, FishSchoolProperty);
            // promises.push(group.createGroup(scene));
            group.createGroup(scene);
            groups.push(group);
            // octree.insert(group);
            octrees[FishSchoolProperty.id].insert(group);
        }
    });

    const rockLoader = new GLTFLoader();
    // rockLoader.setDRACOLoader(dracoLoader);
    rockLoader.load('/models/rock_moss_set_02_1k.gltf', (gltf) => {
        // rockLoader.load('/models/rock_moss_set_02_1k-v2.glb', (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
            if (child.isMesh) {
                child.frustumCulled = false;
                // 模型阴影
                child.castShadow = true;
                //模型自发光
                child.material.emissive = child.material.color;
                child.material.emissiveMap = child.material.map;
            }
        });
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < model.children.length * 2; j++) {
                let rockPos = new Vector3(
                    FishActivityRange[i].xCen + (Math.random() * 0.8 - 0.4) * Math.abs(FishActivityRange[i].xMax - FishActivityRange[i].xMin) / 2,
                    -100,
                    FishActivityRange[i].zCen + (Math.random() * 0.8 - 0.4) * Math.abs(FishActivityRange[i].zMax - FishActivityRange[i].zMin) / 2);

                rock(scene, rockPos, model.children[j % model.children.length]);
            }
        }
    });

    // for (let i = 0; i < 5; i++) {
    //     for (let j = 0; j < 5; j++) {
    //         let rockPos1 = new Vector3(
    //             FishActivityRange[i].xCen + (Math.random() - 0.5) * Math.abs(FishActivityRange[i].xMax - FishActivityRange[i].xMin) / 2,
    //             -100,
    //             FishActivityRange[i].zCen + (Math.random() - 0.5) * Math.abs(FishActivityRange[i].zMax - FishActivityRange[i].zMin) / 2);

    //         const rock1Loader = new GLTFLoader();
    //         rock1Loader.setDRACOLoader(dracoLoader);
    //         rock1Loader.load('/models/SmallRock-v1.glb', (gltf) => {
    //             const model = gltf.scene;
    //             model.traverse((child) => {
    //                 if (child.isMesh) {
    //                     child.frustumCulled = false;
    //                     // 模型阴影
    //                     child.castShadow = true;
    //                     //模型自发光
    //                     child.material.emissive = child.material.color;
    //                     child.material.emissiveMap = child.material.map;
    //                 }
    //             });
    //             rock1(scene, rockPos1, model);
    //         });

    //         let rockPos2 = new Vector3(
    //             FishActivityRange[i].xCen + (Math.random() - 0.5) * Math.abs(FishActivityRange[i].xMax - FishActivityRange[i].xMin) / 2,
    //             -100,
    //             FishActivityRange[i].zCen + (Math.random() - 0.5) * Math.abs(FishActivityRange[i].zMax - FishActivityRange[i].zMin) / 2);
    //         const rock2Loader = new GLTFLoader();
    //         rock2Loader.setDRACOLoader(dracoLoader);
    //         rock2Loader.load('/models/rock.glb', (gltf) => {
    //             const model = gltf.scene;
    //             model.traverse((child) => {
    //                 if (child.isMesh) {
    //                     child.frustumCulled = false;
    //                     // 模型阴影
    //                     child.castShadow = true;
    //                     //模型自发光
    //                     child.material.emissive = child.material.color;
    //                     child.material.emissiveMap = child.material.map;
    //                 }
    //             });
    //             rock1(scene, rockPos2, model);
    //         });
    //     }
    // }


    // function updateTrail() {
    //     // 如果路径变得太长，请删除最旧的点
    //     if (trailPoints.length > 50) {
    //         trailPoints.shift();
    //     }

    //     // 更新轨迹几何形状
    //     trailGeometry.setFromPoints(trailPoints);
    // }
    // const trail = new Line(trailGeometry, trailMaterial);
    // scene.add(trail);
    const boxSize = 20; // 八叉树搜索 groups 的范围
    let allFloatingSpeeds = new Array(6);
    let allAmplitudes = new Array(6);
    let sphereStops = Array.from({ length: 6 }, () => []);
    let fishStops = Array.from({ length: 6 }, () => false);
    let targetPosition = Array.from({ length: 6 }, () => []);
    let direction = Array.from({ length: 6 }, () => []);
    let lastRemovalTime = Array.from({ length: 6 }, () => []);
    const colors = [0xffff00, 0xff0000];

    // const arr = Array.from({ length: 6 }, () => []);
    // arr[0] = []
    // arr[0][1] = 0;
    // console.log(arr);
    const Update = (timestamp) => {

        // var delta = Clock.getDelta(); // 古老可靠的增量时间
        for (let i = 0; i < groups.length; i++) { // 循环遍历每个 group 以更新其值
            // 为八叉树创建新的搜索区域
            let search = new Box(
                groups[i].position.x - (boxSize * 0.5),
                groups[i].position.y - (boxSize * 0.5),
                groups[i].position.z - (boxSize * 0.5),
                boxSize,
                boxSize,
                boxSize
            );
            // let q = octree.query(search); // 在该框内创建一个新的 盒子 列表
            let q = octrees[Math.floor(i / 10) % 6].query(search); // 在该框内创建一个新的 盒子 列表
            if (groups[i].isDed) continue;
            groups[i].flock(q); // 使用周围的 群体 在此 群体 上运行算法
            groups[i].update(q); // 更新这个群体的位置
            if (spheres.length > 0) {
                const index = Math.floor(i / 10) % 6;
                // if (groups[i].position.distanceTo(groups[i].targetPosition) < 10 && spheres[index].count !== 0) {
                //     fishStops[index] = true;
                // }
                if (lpPos.length > 0 && groups[i].position.distanceTo(lpPos[index]) < 10 && !fishStops[index]) {
                    for (let j = 0; j < spheres[index].length; j++) {
                        if (spheres[index][j].count !== 0) {
                            fishStops[index] = true;
                        }
                    }
                }
            }
        }

        if (isPredict) {
            for (let i = 0; i < 6; i++) {
                spheres[i].length = 0;
                spherePos[i].length = 0;
                allFloatingSpeeds[i] = [];
                allAmplitudes[i] = [];
                targetPosition[i] = [];
                direction[i] = [];
                for (let j = 0; j < 2; j++) {
                    generateSphere({
                        id: i, radius: 0.02, color: colors[j], count: 200,
                        floatingSpeeds: allFloatingSpeeds[i], amplitudes: allAmplitudes[i]
                    });
                    scene.add(spheres[i][j]);
                    const len = spheres[i][j].count;
                    sphereStops[i].push(...Array.from({ length: len }, () => false));
                    lastRemovalTime[i][j] = 0;
                }
            }

            isPredict = false;
        }

        for (let i = 0; i < spheres.length; i++) {
            for (let j = 0; j < spheres[i].length; j++) {
                runAnimate(i, j, 200, sphereStops[i], fishStops[i], targetPosition[i],
                    direction[i], timestamp, lastRemovalTime[i], allFloatingSpeeds[i],
                    allAmplitudes[i]);
            }
        }


        // updateTrail();
        // 方1
        // if (start === spheres.length - 1) {
        //     spheres = [];
        //     stop = false;
        // }
        // const deltaTime = timestamp - lastRemovalTime;
        // if (deltaTime >= removalInterval && stop) {
        //     lastRemovalTime = timestamp;
        //     if (start < spheres.length) {
        //         const sphere = spheres[start];
        //         sphere.geometry.dispose();
        //         sphere.material.dispose();
        //         sphereGroup.remove(sphere);
        //         start++;
        //      // 卡顿
        //      // let mesh = spheres.shift();
        //      // mesh.geometry.dispose();
        //      // mesh.material.dispose();
        //      // sphereGroup.remove(mesh);
        //     }
        // }
        // for (let index = start; index < spheres.length; index++) {
        //     const sphere = spheres[index];
        //     // 根据时间和浮动速度计算新的 y 坐标
        //     const newY = Math.sin(timestamp * floatingSpeeds[index]) * amplitudes[index];
        //     sphere.position.y = newY;
        // }

        requestAnimationFrame(Update);
    };
    Update();

    for (let i = 0; i < 6; i++) {
        generateFeeder();
        feeders[i].position.set(
            FishActivityRange[i].xCen + Math.pow(-1, Math.floor(i / 3)) * ((FishActivityRange[i].xMax - FishActivityRange[i].xMin) / 2),
            66.1,
            FishActivityRange[i].zCen);
        feeders[i].rotation.y = Math.PI * Math.floor(i / 3);
        scene.add(feeders[i]);
    }

    // const dracoLoader = new DRACOLoader();
    // dracoLoader.setDecoderPath("./draco/gltf/");
    // dracoLoader.setDecoderConfig({ type: "js" });
    // const gltfLoader = new GLTFLoader();
    // gltfLoader.setDRACOLoader(dracoLoader);
    // var promise = gltfLoader.loadAsync("./assets/Fish.glb");

    // await promise.then((gltf) => {
    //     // 获取模型的第一个网格
    //     var mesh = gltf.scene.children[0];
    //     // 计算鱼模型的包围盒
    //     var bbox = new Box3().setFromObject(mesh);
    //     // 变量以调整并重新定位网格位置
    //     var center = new Vector3();
    //     var size = new Vector3();
    //     bbox.getCenter(center);
    //     bbox.getSize(size);
    //     mesh.rotateX(Math.PI / 2);
    //     // 缩放个平移矩阵
    //     var sca = new Matrix4();
    //     var tra = new Matrix4();
    //     // 应用变换和缩放变量到矩阵
    //     var scaleFact = 7 / size.length();
    //     sca.makeScale(scaleFact, scaleFact, scaleFact);
    //     tra.makeTranslation(-center.x, -center.y, -bbox.min.z);
    //     // 应用矩阵到网格
    //     mesh.applyMatrix4(tra);
    //     mesh.applyMatrix4(sca);
    //     // 使鱼网格面向 X 轴
    //     mesh.rotation.x = Math.PI / 2;
    //     // 将网格放置到位置
    //     mesh.position.set(0, 0.2, 0);
    //     // 将网格添加到场景
    //     scene.add(mesh);
    //     // console.log(mesh.children[0].geometry.attributes.position.data.array);
    //     console.log(mesh.children[0]);

    //     const axisDirectionXY1 = new Vector3(1, 1, 0).sub(new Vector3(1, 0, 0)).normalize();
    //     const axisDirectionXY2 = new Vector3(1, 0, 1).sub(new Vector3(1, 0, 0)).normalize();

    //     // 定义圆周运动的参数
    //     const radius = 5;          // 圆的半径
    //     const angularSpeed = 0.05; // 角速度，控制圆周运动的速度

    //     // 定义初始角度
    //     let angle = 0;

    //     // 更新物体的位置，使其绕着 Z 轴进行圆周运动
    //     function updatePosition() {
    //         // 计算下一帧的角度
    //         angle += angularSpeed;

    //         // 使用三角函数计算物体在圆周运动中的位置
    //         const x = radius * Math.cos(angle);
    //         const z = radius * Math.sin(angle);

    //         // 将新的位置应用到鱼上
    //         mesh.position.set(-x, mesh.position.y, -z);

    //         // 计算当前位置的切线方向向量
    //         const tangentVector = new Vector3(-Math.sin(angle), 0, Math.cos(angle)).normalize();

    //         // 计算鱼朝向切线方向的旋转角度
    //         const rotationAngle = Math.atan2(tangentVector.z, tangentVector.x);

    //         const quaternion = new Quaternion().setFromAxisAngle(new Vector3(0, -1, 0), angle / 2);
    //         // 将旋转角度应用到鱼模型上，绕着 y 轴旋转
    //         mesh.quaternion.copy(quaternion);
    //     }

    //     // 定义鱼尾动画函数
    //     function animateTail() {
    //         console.log(mesh.position.x);

    //         const time = performance.now() * 0.001;
    //         const angle = Math.sin(time * 5) * Math.PI / 64;
    //         // 获取顶点位置数据数组
    //         // mesh.children[0].rotation.y = angle;
    //         // mesh.children[0].rotation.z = angle;
    //         // console.log(mesh.children[0].geometry.boundingSphere.center.x);

    //         // const quaternion1 = new Quaternion().setFromAxisAngle(axisDirectionXY1, angle);
    //         // const quaternion2 = new Quaternion().setFromAxisAngle(axisDirectionXY2, angle);
    //         // const combinedQuaternion = new Quaternion();
    //         // combinedQuaternion.multiplyQuaternions(quaternion1, quaternion2);
    //         // mesh.quaternion.copy(combinedQuaternion);

    //         // swimData = update();
    //         // wiggleValue = swimData.xRotation.x;

    //         // mesh.position.z += 1;
    //         updatePosition();


    //         // 标记顶点位置已更新
    //         // mesh.children[0].geometry.attributes.position.data.updateRange = true;

    //         requestAnimationFrame(animateTail);

    //     }
    //     animateTail();
    //     // function animate() {
    //     //     requestAnimationFrame(animate);
    //     //     swimData = update();
    //     //     speed = swimData.speed / 2000;
    //     //     wiggleValue = swimData.xRotation.x;

    //     //     pt = swimPath.spline.getPoint(t);

    //     //     tangent = swimPath.spline.getTangent(t);

    //     //     if (tangent.x > 0 && tangent.y < 0.06712 && tangent.y > 0.06710) {
    //     //         tangent.x *= -1;
    //     //         tangent.y *= -1;
    //     //         tangent.z *= -1;
    //     //     }

    //     //     // 计算下一帧的角度
    //     //     angle += angularSpeed;

    //     //     // 使用三角函数计算物体在圆周运动中的位置
    //     //     const x = radius * Math.cos(angle);
    //     //     const z = radius * Math.sin(angle);

    //     //     // 将新的位置应用到鱼上
    //     //     mesh.position.set(x, mesh.position.y, z);

    //     //     axis.crossVectors(up, tangent).normalize();

    //     //     mesh.rotation.z = wiggleValue + offset;
    //     //     // mesh.quaternion.setFromAxisAngle(axis, wiggleValue + offset);

    //     //     t = t >= 1 ? 0 : t += speed;
    //     // }
    //     // animate();
    // }).catch();
    // gltfLoader.load("./public/assets/Fish.glb", (gltf) => {
    //     // const rootNode = gltf.scene;
    //     // rootNode.position.set(0, 0.2, 0);
    //     // scene.add(rootNode);
    // });

    // 添加直线光
    // const light1 = new DirectionalLight(0xffffff, 0.3);
    // light1.position.set(0, 10, 10);
    // const light2 = new DirectionalLight(0xffffff, 0.3);
    // light1.position.set(0, 10, -10);
    // const light3 = new DirectionalLight(0xffffff, 0.8);
    // light1.position.set(10, 10, 10);
    // scene.add(light1, light2, light3);

    // 添加环境光
    // const ambient = new AmbientLight(0xffffff, 0.4);
    // scene.add(ambient);

    // 添加光阵
    // let video = document.createElement("video");
    // video.src = "./assets/zp2.mp4";
    // video.loop = true;
    // video.muted = true;
    // video.play();
    // let videoTexture = new VideoTexture(video);
    // const videoGeoPlane = new PlaneGeometry(8, 4.5);
    // const videoMaterial = new MeshBasicMaterial({
    //     map: videoTexture,
    //     transparent: true,
    //     side: DoubleSide,
    //     alphaMap: videoTexture,
    // });
    // const videoMesh = new Mesh(videoGeoPlane, videoMaterial);
    // videoMesh.geometry = videoGeoPlane;
    // videoMesh.material = videoMaterial;
    // videoMesh.position.set(0, 0.2, 0);
    // videoMesh.rotation.set(-Math.PI / 2, 0, 0);
    // scene.add(videoMesh);
}

function generateHeight(width, height) {
    let seed = Math.PI / 4;
    window.Math.random = function () {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    const size = width * height;
    const data = new Float32Array(size);

    const hRange = 15;
    const numRows = 2;
    const numCols = 3;
    const outerRing = 256;

    const subZ = (width - 2 * outerRing) / numCols;
    const subX = (height - 2 * outerRing) / numRows;
    const subZZ = (width) / numCols;
    const subXX = (width) / numRows;

    let k = 0;
    let w2 = [];
    let d2 = [];
    let slopeRadiusMax = [];
    let slopeRadiusMin = [];
    const center = width / 2;
    const innerRadius = Math.sqrt(
        Math.pow((outerRing - width / 2) / (width / 2), 2.0) +
        Math.pow((outerRing - height / 2) / (height / 2), 2.0));
    const outerRadius = Math.sqrt(
        Math.pow((width / 2) / (width / 2), 2.0));

    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            w2[k] = Math.floor(subZ / 2 + j * subZ) + outerRing;
            d2[k] = Math.floor(subX / 2 + i * subX) + outerRing;
            const maxRadius = Math.sqrt(
                Math.pow((subZ * (j + 1) + outerRing - w2[k]) / (w2[k] - subZ * j - outerRing), 2.0) +
                Math.pow((subX * (i + 1) + outerRing - d2[k]) / (d2[k] - subX * i - outerRing), 2.0));
            slopeRadiusMax[k] = maxRadius * 0.68;
            slopeRadiusMin[k] = maxRadius * 0.4;

            // 限制鱼群移动范围
            FishActivityRange[k].xMax = Math.floor(k / 3) === 0 ? subXX : 0;
            FishActivityRange[k].xMin = Math.floor(k / 3) === 0 ? 0 : -subXX;
            FishActivityRange[k].xCen = Math.floor(k / 3) === 0 ? subXX / 2 : -subXX / 2;
            FishActivityRange[k].yMax = 0;
            FishActivityRange[k].yMin = -100;
            FishActivityRange[k].yCen = -50;
            FishActivityRange[k].zMax = (subZZ / 2) * (-1 + (k % 3) * 2);
            FishActivityRange[k].zMin = (subZZ / 2) * (-3 + (k % 3) * 2);
            FishActivityRange[k].zCen = subZZ * (-1 + (k % 3) * 1);

            k++;
        }
    }

    for (let i = 0; i < octrees.length; i++) {
        octrees[i] = new Octree(
            new Box(
                FishActivityRange[i].xMin, 0, FishActivityRange[i].zMin,
                subXX, 100, subZZ
            ), 10
        );
    }

    let p = 0;
    const calculateHeight = (i, j, k) => {
        const radius = Math.sqrt(
            Math.pow((i - w2[k]) / (w2[k] - (subZ * (k % 3) + outerRing)), 2.0) +
            Math.pow((j - d2[k]) / (d2[k] - (subX * Math.floor(k / 3) + outerRing)), 2.0));
        if (radius >= slopeRadiusMin[k] && radius <= slopeRadiusMax[k]) {
            const t = (radius - slopeRadiusMin[k]) / (slopeRadiusMax[k] - slopeRadiusMin[k]);
            // 调用示例
            // const r = inverseSmoothStep(0, 1, smoothStep(0, 1, t) * hRange, hRange, slopeRadiusMin[k], slopeRadiusMax[k]);
            return smoothStep(0, 1, t) * hRange;
        } else if (radius > slopeRadiusMax[k]) {
            return hRange;
        } else if (radius < slopeRadiusMin[k]) {
            return 0;
        }
    };
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            let height = -1;

            if (i >= outerRing && i < subZ + outerRing) {
                if (j >= outerRing && j < subX + outerRing) {
                    height = calculateHeight(i, j, 0);
                } else if (j >= subX + outerRing && j < subX * 2 + outerRing) {
                    height = calculateHeight(i, j, 3);
                }
            }
            if (i >= subZ + outerRing && i < 2 * subZ + outerRing) {
                if (j >= outerRing && j < subX + outerRing) {
                    height = calculateHeight(i, j, 1);
                } else if (j >= subX + outerRing && j < subX * 2 + outerRing) {
                    height = calculateHeight(i, j, 4);
                }
            }
            if (i >= 2 * subZ + outerRing && i < width - outerRing) {
                if (j >= outerRing && j < subX + outerRing) {
                    height = calculateHeight(i, j, 2);
                } else if (j >= subX + outerRing && j < subX * 2 + outerRing) {
                    height = calculateHeight(i, j, 5);
                }
            }

            if (height === -1) {
                const radius = Math.sqrt(
                    Math.pow((i - center) / center, 2.0) +
                    Math.pow((j - center) / center, 2.0)
                );
                if (radius >= innerRadius && radius <= outerRadius) {
                    const t = (radius - innerRadius) / (outerRadius - innerRadius);
                    height = smoothStepFlip(0, 1, t) * hRange;
                } else if (radius > outerRadius) {
                    height = 0;
                } else if (radius < innerRadius) {
                    height = hRange;
                }
            }

            data[p] = height;
            p++;
        }
    }

    /**
     * 需修改才能用
     */
    // for (let k = 0; k < numRows * numCols; k++) {
    //     const centerX = w2[k];
    //     const centerZ = d2[k];

    //     for (let i = subZ * (k % 3); i < subZ * ((k % 3) + 1); i++) {
    //         for (let j = subX * Math.floor(k / 3); j < subX * (Math.floor(k / 3) + 1); j++) {

    //             const radius = Math.sqrt(
    //                 Math.pow((i - centerX) / (centerX - subZ * (k % 3)), 2.0) +
    //                 Math.pow((j - centerZ) / (centerZ - subX * Math.floor(k / 3)), 2.0));
    //             let height = 0;
    //             if (radius >= slopeRadiusMin[k] && radius <= slopeRadiusMax[k]) {
    //                 // 使用sigmoid函数来实现平滑过渡
    //                 const t = (radius - slopeRadiusMin[k]) / (slopeRadiusMax[k] - slopeRadiusMin[k]);
    //                 height = sigmoid((t - 0.5) * 12) * hRange;
    //             } else if (radius < slopeRadiusMin[k]) {
    //                 height = 0;
    //             } else {
    //                 height = hRange;
    //             }
    //             data[p] = height;

    //             pp.push(height);
    //             p++;
    //         }
    //     }
    // }

    return data;
}

function generateFeeder() {
    const boxGeometry = new BoxGeometry(4, 4, 4); // 参数依次为长宽高
    // 创建材质
    const boxMaterial = new MeshBasicMaterial({ color: 0x000000, side: DoubleSide });
    // 创建正方体网格对象
    const box = new Mesh(boxGeometry, boxMaterial);
    box.position.set(0, 0, 0);

    const volumeVertices = new Float32Array
        ([
            -2, -1, -1,
            2, -1, -1,
            -2, -1, 1,
            2, -1, 1,

            0, 1, -1,
            4, 1, -1,
            0, 1, 1,
            4, 1, 1
        ]);

    const volumeIndices =
        [
            2, 3, 0, 3, 1, 0,
            0, 1, 4, 1, 5, 4,
            1, 3, 5, 3, 7, 5,
            3, 2, 7, 2, 6, 7,
            4, 5, 7, 4, 7, 6
            // 2, 0, 6, 0, 4, 6
        ];

    const volumeGeometry = new BufferGeometry();
    volumeGeometry.setAttribute("position", new THREE.BufferAttribute(volumeVertices, 3));
    volumeGeometry.setIndex(volumeIndices);
    const edges = new THREE.EdgesGeometry(volumeGeometry, 2);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
    line.position.set(-3.06, -0.8, 0);
    line.scale.set(0.5, 0.5, 0.4);
    line.rotation.z = Math.PI / 4;
    // 创建材质
    var volumeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: DoubleSide });

    // 创建网格对象
    const cube = new THREE.Mesh(volumeGeometry, volumeMaterial);
    cube.position.set(-3.06, -0.8, 0);
    cube.scale.set(0.5, 0.5, 0.4);
    cube.rotation.z = Math.PI / 4;

    const feeder = new THREE.Group();
    feeder.add(box);
    feeder.add(line);
    feeder.add(cube);

    feeder.scale.set(8, 8, 8);

    feeders.push(feeder);
}

async function generateSphere(options) {
    options = options || {};
    const color = options.color !== undefined ? options.color : 0xffffff;
    const radius = options.radius !== undefined ? options.radius : 0.01;
    const count = options.count !== undefined ? options.count : 1000;

    const sphereGeometry = new THREE.SphereGeometry(radius);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: color });
    // 方1
    // const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    // const sphereGroup = new THREE.Group();
    const sphere = new THREE.InstancedMesh(sphereGeometry, sphereMaterial, count);
    sphere.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    // 为每个球创建一个初始浮动速度和振幅
    for (let index = 0; index < sphere.count; index++) {
        options.floatingSpeeds.push(0.001 + Math.random() * 0.002); // 设置一个随机的浮动速度（在 0.001 到 0.003 之间）
        options.amplitudes.push(0.005 + Math.random() * 0.005); // 设置一个随机的振幅（在 0.1 到 0.2 之间）
    }

    const poly = [
        { x: -4 - Math.sqrt(2) * 0.8, y: -3.2 },
        { x: -4 + Math.sqrt(2) * 0.8, y: -1.2 },
        { x: -4 + Math.sqrt(2) * 0.8, y: -0.2 },
        { x: -4 - Math.sqrt(2) * 0.8, y: -2.2 }
    ];
    var index = 0;
    const matrix = new Matrix4();
    while (true) {
        // for (let index = 0; index < 1000; index++) {
        //     方1
        //     const mesh = sphere.clone();
        //     mesh.position.set(Math.random() * 10, 0, Math.random() * 10);
        //     sphereGroup.add(mesh);
        //     spheres.push(mesh); // 将球的引用保存起来
        //     const pos = new Vector3(Math.random() * 10, 0, Math.random() * 10);
        // }
        const pos = new Vector3(-3 + (Math.random() * 2 - 1) * 0.4, -1.2 + (Math.random() * 4 - 2) * 0.4, Math.random() * 0.7 - 0.35);
        if (pointInPolygon(pos, poly)) {
            feeders[options.id].localToWorld(pos);
            // poss[index] = pos;
            spherePos[options.id].push(pos);

            matrix.setPosition(pos);
            sphere.setMatrixAt(index, matrix);
            index++;
        }
        if (index === sphere.count) break;
    }
    sphere.instanceMatrix.needsUpdate = true;

    spheres[options.id].push(sphere);
}

/**
 * 
 * @param {*} i 第 i 个鱼池
 * @param {*} j 每个鱼池的起始位置
 * @param {*} sphereStops 判断小球是否落到水面
 * @param {*} fishStops 判断是否有鱼进食
 * @param {*} targetPosition 小球的目标移动位置
 * @param {*} direction 小球当前位置和目标位置的方向向量
 * @param {*} timestamp 时间戳
 * @param {*} lastRemovalTime 用于小球的移除时间判断
 * @param {*} floatingSpeeds 小球浮动速度
 * @param {*} amplitudes 小球浮动幅度
 */
async function runAnimate(i, j, count, sphereStops, fishStops, targetPosition,
    direction, timestamp, lastRemovalTime, floatingSpeeds, amplitudes) {
    if (spheres[i][j].count === 0) {
        scene.remove(spheres[i][j]);
        const allCountsZero = spheres[i].every(sphere => sphere.count === 0);
        if (allCountsZero) {
            floatingSpeeds.length = 0;
            amplitudes.length = 0;
            sphereStops.length = 0;
            fishStops = false;
            targetPosition.length = 0;
            direction.length = 0;
            lastRemovalTime[j] = 0;
        }
        spheres[i][j].dispose();
    } else {
        const deltaTime = timestamp - lastRemovalTime[j];
        if (deltaTime >= removalInterval && fishStops) {
            lastRemovalTime[j] = timestamp;
            if (spheres[i][j].count > 0) {
                spheres[i][j].count--;
            }
        }
        const matrix = new THREE.Matrix4();
        const start = count * j;
        for (let index = 0; index < spheres[i][j].count; index++) {

            spheres[i][j].getMatrixAt(index, matrix);
            const pos = new Vector3();
            matrix.decompose(pos, new THREE.Quaternion(), new Vector3());
            if (pos.y > 0 && !sphereStops[index + start]) {

                // const spt = clock.getDelta() * 1000;//两帧渲染时间间隔(秒)
                // // // 在t时间内，以速度v运动的位移量
                // let s = 0.5 * g.clone().y * spt * spt;

                const dis = spherePos[i][index + start].add(new Vector3(-3 * Math.pow(-1, Math.floor(i / 3)), -3, 0));
                matrix.setPosition(dis);
                spheres[i][j].setMatrixAt(index, matrix);
            } else {
                if (lpPos[i] === undefined) {
                    lpPos[i] = spherePos[i][index + start];
                }

                if (!sphereStops[index + start]) {
                    targetPosition[index + start] = new Vector3(
                        FishActivityRange[i].xCen - Math.random() * 100,
                        0,
                        FishActivityRange[i].zCen + Math.random() * 200 - 100);
                    direction[index + start] = new Vector3().subVectors(targetPosition[index + start], spherePos[i][index + start]).normalize();
                }
                sphereStops[index + start] = true;
            }

            if (sphereStops[index + start]) {

                // 根据时间和浮动速度计算新的 y 坐标
                const newY = Math.sin(timestamp * floatingSpeeds[index + start]) * amplitudes[index + start];
                // 构建运动方向向量，朝着 x0z 平面中的一个方向
                if (spherePos[i][index + start].distanceTo(targetPosition[index + start]) > 1) {
                    var avg = new Vector3(0, 0, 0);
                    const movementSpeed = 0.01; // 可调整的移动速度
                    avg.copy(direction[index + start]).multiplyScalar(movementSpeed).clampLength(-0.1, 0.1);
                    spherePos[i][index + start].x += avg.x;
                    spherePos[i][index + start].z += avg.z;
                }
                const movementDirection = new THREE.Vector3(spherePos[i][index + start].x, 0, spherePos[i][index + start].z);
                movementDirection.y = newY;

                // 创建新的矩阵，并设置位置
                matrix.setPosition(movementDirection);
                spheres[i][j].setMatrixAt(index, matrix);
            }
        }
        spheres[i][j].instanceMatrix.needsUpdate = true;
        spheres[i][j].computeBoundingSphere();
    }
}

/**
 * 无用
 */
// let isWiggling = false;
// let wigglesToDo = 0;
// let xRotation = { x: 0 };

// const swim = () => {

//     const INTERVAL = 1000;
//     const MAX_WIGGLE_ROTATION = 0.12;
//     const WIGGLE_PROBABILITY = 0.3;
//     const WIGGLE_DURATION = 2000;

//     const unsetIsWiggling = () => {
//         let interval = setInterval(() => {
//             --wigglesToDo;
//             if (wigglesToDo === 0) {
//                 isWiggling = false;
//                 clearInterval(interval);
//             }
//         }, WIGGLE_DURATION);
//     };

//     const setWiggle = () => {
//         wigglesToDo = Math.floor(Math.random() * (6 - 1)) + 1;
//         isWiggling = true;
//         makeTween(MAX_WIGGLE_ROTATION);

//         unsetIsWiggling();
//     };

//     const maybeWiggle = setInterval(() => {
//         if (!isWiggling) {
//             if (Math.random() < WIGGLE_PROBABILITY) {
//                 setWiggle()
//             }
//         }
//     }, INTERVAL);

//     const makeTween = (to) => new TWEEN.Tween(xRotation)
//         .to({ x: to }, WIGGLE_DURATION / 4)
//         .easing(TWEEN.Easing.Cubic.Out)
//         .onComplete(() => {
//             makeTweenBack(to);
//         }).start();

//     const makeTweenBack = (to) => new TWEEN.Tween(xRotation)
//         .to({ x: 0 }, WIGGLE_DURATION / 4)
//         .easing(TWEEN.Easing.Quadratic.In)
//         .onComplete(() => {
//             if (isWiggling) {
//                 makeTween(-to);
//             }
//         }).start();
// }

// export const Update = () => {

//     var speed = 2;

//     const PUSH = 0.02;
//     const MIN_SPEED = 1;
//     const MAX_SPEED = 5;
//     const INERITA = 0.012;

//     // 减速
//     if (speed >= INERITA + MIN_SPEED) {
//         speed -= INERITA;
//     } else if (speed >= INERITA) {
//         speed = MIN_SPEED;
//     }

//     // 加速
//     if (isWiggling && speed + PUSH < MAX_SPEED) {
//         speed += PUSH;
//     }

//     TWEEN.update();

//     return { speed, isWiggling, wigglesToDo, xRotation };
// }