<template></template>

<script setup>
import { onMounted } from "vue";
import * as TIME from "~/three/utils/Time.js";
import * as SETTINGS from "~/three/shaders/Settings.js";
import * as SCENE from "~/three/Scene.js";
import * as INPUT from "~/three/utils/Input.js";
import * as CONTROL from "~/three/utils/Control.js";
import { OrbitControls } from "three/addons/controls/OrbitControls";

onMounted(() => {
  // console.log(document.getElementById('app'));
  // const mBar = document.getElementById('app');
  // // 添加轨道控制器
  // const controls = new OrbitControls(SCENE.staticCamera, mBar);
  // // 设置带阻尼的惯性
  // controls.enableDamping = true;
  // controls.update();
  // mDom = document.getElementById('app');
});

TIME.Start();
SETTINGS.Start();
SCENE.Start();
INPUT.Start();
CONTROL.Start();


requestAnimationFrame(UpdateFrame);

function UpdateFrame() {
  TIME.Update();
  SCENE.Update();
  INPUT.Update();
  CONTROL.Update();

  requestAnimationFrame(UpdateFrame);
}

// const screenDom = ref(null);
// console.log(screenDom);

// // 创建场景
// const scene = new THREE.Scene();

// // 创建相机
// const camera = new THREE.PerspectiveCamera(
//   75, // 视角
//   window.innerWidth / window.innerHeight, // 宽高比
//   0.1, // 近平面
//   1000 // 远平面
// );
// // 设置相机位置
// camera.position.set(0, 1.5, 6);
// camera.lookAt(0, 0, 0);

// onMounted(() => {
//   // document.getElementById('app').style.pointerEvents = 'none';
//   const mBar = document.getElementById('app').childNodes[0];
//   // console.log(mBar.style.touchAction)
//   // 添加轨道控制器
//   const controls = new OrbitControls(camera, mBar);
//   // 设置带阻尼的惯性
//   controls.enableDamping = true;
//   controls.update();
// });

// // 创建渲染器
// const renderer = new THREE.WebGLRenderer({ antialias: true });
// renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.domElement.style.zIndex = -1;
// renderer.domElement.style.pointerEvents = 'auto';
// document.body.appendChild(renderer.domElement);

// // 添加世界坐标辅助器
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// // 创建rgbe加载器
// const hdrLoader = new RGBELoader();
// hdrLoader.load("../../public/assets/sky12.hdr", (texture) => {
//   texture.mapping = THREE.EquirectangularReflectionMapping;
//   scene.background = texture;
//   scene.environment = texture;
// });

// // 添加机器人
// // 设置解压缩的加载器
// const dracoLoader = new DRACOLoader();
// dracoLoader.setDecoderPath("../../public/draco/gltf/");
// dracoLoader.setDecoderConfig({ type: "js" });
// const gltfLoader = new GLTFLoader();
// gltfLoader.setDRACOLoader(dracoLoader);
// gltfLoader.load("../../public/assets/robot.glb", (gltf) => {
//   scene.add(gltf.scene);
// });

// // 添加直线光
// const light1 = new THREE.DirectionalLight(0xffffff, 0.3);
// light1.position.set(0, 10, 10);
// const light2 = new THREE.DirectionalLight(0xffffff, 0.3);
// light1.position.set(0, 10, -10);
// const light3 = new THREE.DirectionalLight(0xffffff, 0.8);
// light1.position.set(10, 10, 10);
// scene.add(light1, light2, light3);

// // 添加环境光
// const ambient = new THREE.AmbientLight(0xffffff, 0.4);
// scene.add(ambient);

// // 添加光阵
// let video = document.createElement("video");
// video.src = "../../public/assets/zp2.mp4";
// video.loop = true;
// video.muted = true;
// video.play();
// let videoTexture = new THREE.VideoTexture(video);
// const videoGeoPlane = new THREE.PlaneGeometry(8, 4.5);
// const videoMaterial = new THREE.MeshBasicMaterial({
//   map: videoTexture,
//   transparent: true,
//   side: THREE.DoubleSide,
//   alphaMap: videoTexture,
// });
// const videoMesh = new THREE.Mesh(videoGeoPlane, videoMaterial);
// videoMesh.position.set(0, 0.2, 0);
// videoMesh.rotation.set(-Math.PI / 2, 0, 0);
// scene.add(videoMesh);

// // 添加镜面反射
// let reflectorGeometry = new THREE.PlaneGeometry(100, 100);
// let reflectorPlane = new Reflector(reflectorGeometry, {
//   textureWidth: window.innerWidth,
//   textureHeight: window.innerHeight,
//   color: 0x332222,
// });
// reflectorPlane.rotation.x = -Math.PI / 2;
// scene.add(reflectorPlane);

// // // 创建几何体
// // const geometry = new THREE.BoxGeometry(1, 1, 1);
// // // 创建材质
// // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// // // 创建网格
// // const cube = new THREE.Mesh(geometry, material);
// // // 将网格添加到场景中
// // scene.add(cube);

// function animate() {
//   requestAnimationFrame(animate);
//   // 旋转
//   // cube.rotation.x += 0.01;
//   // cube.rotation.y += 0.01;
//   // 渲染
//   renderer.render(scene, camera);
// }
// animate();

// // 监听窗口变化
// window.addEventListener("resize", () => {
//   // 重置渲染器宽高比
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   // 设置渲染器的像素比
//   renderer.setPixelRatio(window.devicePixelRatio);
//   // 重置相机宽高比
//   camera.aspect = window.innerWidth / window.innerHeight;
//   // 更新相机投影矩阵
//   camera.updateProjectionMatrix();
// });

// // var btn = document.createElement("button");
// // btn.innerHTML = "点击全屏";
// // btn.style.position = "absolute";
// // btn.style.top = "10px";
// // btn.style.left = "10px";
// // btn.style.zIndex = "999";
// // btn.onclick = function () {
// //     // 全屏
// //     document.body.requestFullscreen();
// // };
// // document.body.appendChild(btn);

// let eventObj = {
//   Fullscreen: function () {
//     // 全屏
//     document.body.requestFullscreen();
//   },
//   ExitFullscreen: function () {
//     document.exitFullscreen();
//   },
// };

// // 创建GUI
// const gui = new GUI();
// // 添加按钮
// gui.add(eventObj, "Fullscreen").name("全屏");
// gui.add(eventObj, "ExitFullscreen").name("退出全屏");
// // 控制立方体的位置
// let folder = gui.addFolder("立方体位置");
// folder.add(cube.position, "x", -10, 10).step(1).name("立方体x轴的位置");
// folder.add(cube.position, "y", -10, 10).step(1).name("立方体y轴的位置");
// folder.add(cube.position, "z", -10, 10).step(1).name("立方体z轴的位置");
// gui.add(material, "wireframe").name("模式");

// let colorParams = {
//     cubeColor: "#00ff00"
// }
// gui.addColor(colorParams, "cubeColor").name("立方体颜色").onChange((val) => {
//     cube.material.color.set(val);
// })

</script>

<style></style>