import { Group, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import * as Skybox from "./scene/SkyBox.js";
import * as Ocean from "./scene/Ocean.js";
import * as Floor from "./scene/Floor.js";
import * as FishPond from "./scene/FishPond.js";

export const body = document.createElement("div");

const canvas = document.createElement('canvas');
export const renderer = new WebGLRenderer({
    // canvas: canvas,
    // context: canvas.getContext('webgl2'),
    antialias: true, // 抗锯齿 
});
export const scene = new Scene();
export const camera = new PerspectiveCamera();
// export const staticCamera = new PerspectiveCamera();
export const dynamicCamera = new PerspectiveCamera();
export const staticScene = new Group();

export const cameraRight = new Vector3();
export const cameraUp = new Vector3();
export const cameraForward = new Vector3();

export function UpdateCameraRotation() {
    cameraRight.copy(new Vector3(1, 0, 0).applyQuaternion(camera.quaternion));
    cameraUp.copy(new Vector3(0, 1, 0).applyQuaternion(camera.quaternion));
    cameraForward.copy(new Vector3(0, 0, -1).applyQuaternion(camera.quaternion));
}

export let resMult = 1;
export function SetResolution(value) {
    resMult = value;
    let width = window.innerWidth * value * window.devicePixelRatio;
    let height = window.innerHeight * value * window.devicePixelRatio;
    if (window.innerWidth < window.innerHeight) {
        width = window.innerHeight * value * window.devicePixelRatio;
        height = window.innerWidth * value * window.devicePixelRatio;
        body.style.transform = "rotate(90deg) translate(0%, -100%)";
        body.style.width = window.innerHeight + "px";
        body.style.height = window.innerWidth + "px";
    } else {
        body.style.transform = "";
        body.style.width = window.innerWidth + "px";
        body.style.height = window.innerHeight + "px";
    }

    renderer.setSize(width, height, false);
}

export let fov = 70;
export function SetFOV(value) {
    fov = value;
    camera.fov = value;
    camera.updateProjectionMatrix();
}

export let antialias = false;
export function SetAntialias(value) {
    antialias = value;
    renderer.antialias = antialias;
}

export function Start() {

    // 设置显示层级
    body.style.zIndex = -1;
    document.body.appendChild(body);

    let width = window.innerWidth * resMult * window.devicePixelRatio;
    let height = window.innerHeight * resMult * window.devicePixelRatio;
    if (window.innerWidth < window.innerHeight) {
        width = window.innerHeight * resMult * window.devicePixelRatio;
        height = window.innerWidth * resMult * window.devicePixelRatio;
        body.style.transform = "rotate(90deg) translate(0%, -100%)";
        body.style.width = window.innerHeight + "px";
        body.style.height = window.innerWidth + "px";
    } else {
        body.style.transform = "";
        body.style.width = window.innerWidth + "px";
        body.style.height = window.innerHeight + "px";
    }

    renderer.setSize(width, height, false);
    renderer.antialias = antialias;
    renderer.autoClearColor = false;
    body.appendChild(renderer.domElement);

    camera.fov = fov;
    camera.aspect = width / height;
    camera.near = 0.3;
    camera.far = 4000;
    camera.position.set(100, 200, 100);
    camera.updateProjectionMatrix();

    UpdateCameraRotation();

    // staticCamera.fov = 75;
    // staticCamera.aspect = width / height;
    // staticCamera.near = 0.01;
    // staticCamera.far = 4000;
    // staticCamera.updateProjectionMatrix();
    // staticCamera.position.set(0, 3, 6);

    dynamicCamera.fov = 60;
    dynamicCamera.aspect = width / height;
    dynamicCamera.near = 0.1;
    dynamicCamera.far = 10;
    dynamicCamera.position.set(0, 0, 0);
    dynamicCamera.updateProjectionMatrix();

    window.onresize = function () {
        width = window.innerWidth * resMult * window.devicePixelRatio;
        height = window.innerHeight * resMult * window.devicePixelRatio;
        if (window.innerWidth < window.innerHeight) {
            width = window.innerHeight * resMult * window.devicePixelRatio;
            height = window.innerWidth * resMult * window.devicePixelRatio;
            body.style.transform = "rotate(90deg) translate(0%, -100%)";
            body.style.width = window.innerHeight + "px";
            body.style.height = window.innerWidth + "px";
        } else {
            body.style.transform = "";
            body.style.width = window.innerWidth + "px";
            body.style.height = window.innerHeight + "px";
        }

        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        // staticCamera.aspect = width / height;
        // staticCamera.updateProjectionMatrix();

        dynamicCamera.aspect = width / height;
        dynamicCamera.updateProjectionMatrix();
    }

    Skybox.Start();
    scene.add(Skybox.skybox);

    Ocean.Start();
    scene.add(Ocean.surface);

    // Floor.Start();
    // for (let i = 0; i < Floor.tiles.length; i++) {
    //     scene.add(Floor.tiles[i]);
    // }

    FishPond.Start();
    // scene.add(SphericalRobot.videoMesh);
}

export function Update() {
    Skybox.Update();
    Ocean.Update();
    // Floor.Update();
    // SphericalRobot.Update();

    renderer.render(scene, camera);
    renderer.render(staticScene, dynamicCamera);
}