import { DoubleSide, RepeatWrapping, ShaderMaterial, TextureLoader, Uniform } from "three";
import * as OceanShaders from "../shaders/OceanShaders.js";
import { cameraForward } from "../Scene";
import { timeUniform } from "../utils/Time.js";
import { SetSkyboxUniforms } from "./SkyboxMaterial.js";

export const surface = new ShaderMaterial(); // 表面着色器材质
export const volume = new ShaderMaterial(); // 体积着色器材质
export const object = new ShaderMaterial(); // 物体着色器材质
export const triplanar = new ShaderMaterial(); // 三平面着色器材质

const normalMap1 = new Uniform(new TextureLoader().load("./src/assets/images/waterNormal1.png")); // 水波纹理
normalMap1.value.wrapS = RepeatWrapping;
normalMap1.value.wrapT = RepeatWrapping;
const normalMap2 = new Uniform(new TextureLoader().load("./src/assets/images/waterNormal2.png"));
normalMap2.value.wrapS = RepeatWrapping;
normalMap2.value.wrapT = RepeatWrapping;

const spotLightSharpness = 10; // 聚光灯锐度，确定光锥边缘渐变的速度

export const spotLightDistance = 200; // 聚光灯距离
export const spotLightDistanceUniform = new Uniform(spotLightDistance);

const objectTexture = new TextureLoader().load("./src/assets/images/basicChecker.png"); // 物体纹理
objectTexture.wrapS = RepeatWrapping;
objectTexture.wrapT = RepeatWrapping;

const landTexture = new TextureLoader().load("./src/assets/images/sand.png"); // 地面纹理
landTexture.wrapS = RepeatWrapping;
landTexture.wrapT = RepeatWrapping;

// 设置混合锐度和三平面纹理的缩放比例
const blendSharpness = 3;
const triplanarScale = 1;

export function Start() {
    // 表面材质
    surface.vertexShader = OceanShaders.surfaceVertex;
    surface.fragmentShader = OceanShaders.surfaceFragment;
    surface.side = DoubleSide;
    surface.transparent = true;

    surface.uniforms = {
        _Time: timeUniform,
        _NormalMap1: normalMap1,
        _NormalMap2: normalMap2
    };
    SetSkyboxUniforms(surface);

    // 体积材质（ps：颜色）
    volume.vertexShader = OceanShaders.volumeVertex;
    volume.fragmentShader = OceanShaders.volumeFragment;
    SetSkyboxUniforms(volume);

    // 物体
    // object.vertexShader = OceanShaders.objectVertex;
    // object.fragmentShader = OceanShaders.objectFragment;
    // object.uniforms = {
    //     _MainTexture: new Uniform(objectTexture),
    //     _CameraForward: new Uniform(cameraForward),
    //     _SpotLightSharpness: new Uniform(spotLightSharpness),
    //     _SpotLightDistance: spotLightDistanceUniform
    // };
    // SetSkyboxUniforms(object);

    // 地面
    triplanar.vertexShader = OceanShaders.triplanarVertex;
    triplanar.fragmentShader = OceanShaders.triplanarFragment;
    triplanar.uniforms = {
        _MainTexture: new Uniform(landTexture),
        _CameraForward: new Uniform(cameraForward),
        _BlendSharpness: new Uniform(blendSharpness),
        _Scale: new Uniform(triplanarScale),
        _SpotLightSharpness: new Uniform(spotLightSharpness),
        _SpotLightDistance: spotLightDistanceUniform
    };
    SetSkyboxUniforms(triplanar);
}