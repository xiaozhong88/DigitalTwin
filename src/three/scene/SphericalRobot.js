import { AxesHelper, DirectionalLight, AmbientLight, VideoTexture, PlaneGeometry, MeshBasicMaterial, DoubleSide, Mesh } from "three";
import { RGBELoader } from "three/addons/loaders/RGBELoader";
import { OrbitControls } from "three/addons/controls/OrbitControls";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
import { Reflector } from "three/addons/objects/Reflector";
import { scene, staticScene, staticCamera, renderer } from "../Scene";

export const videoMesh = new Mesh();

export function Start() {
    // 添加世界坐标辅助器
    // const axesHelper = new AxesHelper(5);
    // staticScene.add(axesHelper);

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

    // 添加机器人
    // 设置解压缩的加载器
    // const dracoLoader = new DRACOLoader();
    // dracoLoader.setDecoderPath("./public/draco/gltf/");
    // dracoLoader.setDecoderConfig({ type: "js" });
    // const gltfLoader = new GLTFLoader();
    // gltfLoader.setDRACOLoader(dracoLoader);
    // gltfLoader.load("./public/assets/robot.glb", (gltf) => {
    //     const rootNode = gltf.scene;
    //     rootNode.position.set(0, 0.2, 0);
    //     scene.add(rootNode);
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
    let video = document.createElement("video");
    video.src = "./public/assets/zp2.mp4";
    video.loop = true;
    video.muted = true;
    video.play();
    let videoTexture = new VideoTexture(video);
    const videoGeoPlane = new PlaneGeometry(8, 4.5);
    const videoMaterial = new MeshBasicMaterial({
        map: videoTexture,
        transparent: true,
        side: DoubleSide,
        alphaMap: videoTexture,
    });
    // const videoMesh = new Mesh(videoGeoPlane, videoMaterial);
    videoMesh.geometry = videoGeoPlane;
    videoMesh.material = videoMaterial;
    videoMesh.position.set(0, 0.2, 0);
    videoMesh.rotation.set(-Math.PI / 2, 0, 0);
    // scene.add(videoMesh);
}