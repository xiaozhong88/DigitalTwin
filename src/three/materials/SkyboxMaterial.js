import { DataTexture, MathUtils, RepeatWrapping, ShaderMaterial, TextureLoader, Uniform, Vector2, Vector3 } from "three";
import { fragment, vertex } from "../shaders/SkyboxShader";
import { dirToLight, rotationMatrix } from "../scene/SkyBox";
import { Random } from "../utils/Random";

export const material = new ShaderMaterial();
export let SetSkyboxUniforms;

const ditherSize = new Uniform(new Vector2()); // 蓝噪声纹理的尺寸，用于抖动抗锯齿
const dither = new Uniform(); // 用于抖动处理
const sunVisibility = new Uniform(1); // 天空明亮度
const twilightTime = new Uniform(0); // 黄昏时间
const twilightVisibility = new Uniform(0); // 黄昏可见度

const starsSeed = 87; // 生成随机星星位置的随机种子
const gridSize = 64; // 星星网格大小
const starsCount = 10000; // 星星数量
const maxOffset = 0.43; // 控制星星在球体表面的最大偏移量，调节星星分布的均匀程度
const starsMap = new Uint8Array(gridSize * gridSize * 24); // 星图，存储星星的位置信息和颜色信息
const stars = new Uniform(); // 存储星星的数据纹理

const specularVisibility = new Uniform(Math.sqrt(sunVisibility.value)); // 镜面反射可见度
const light = new Uniform(new Vector3(1, 1, 1)); // 光源的方向和颜色

const up = new Vector3(0, 1, 0); // 在计算光线方向时，通常会用到这个向量来确定参考方向。指向天空

let intensity = 0; // 存储天空光照强度
let l = 0; // 太阳可见度

function Vector3ToStarMap(dir, value) {
    const absDir = new Vector3(Math.abs(dir.x), Math.abs(dir.y), Math.abs(dir.z));

    const xPositive = dir.x > 0;
    const yPositive = dir.y > 0;
    const zPositive = dir.z > 0;

    let maxAxis = 0;
    let u = 0; // 星星在星图中的水平位置坐标
    let v = 0; // 星星在星图中的垂直位置坐标
    let i = 0; // 星星朝向对应的索引

    // 确定坐标轴和最大分量的方向
    if (xPositive && absDir.x >= absDir.y && absDir.x >= absDir.z) {
        maxAxis = absDir.x;
        u = -dir.z;
        v = dir.y;
        // 右侧面
        i = 0;
    }

    if (!xPositive && absDir.x >= absDir.y && absDir.x >= absDir.z) {
        maxAxis = absDir.x;
        u = dir.z;
        v = dir.y;
        // 左侧面
        i = 1;
    }

    if (yPositive && absDir.y >= absDir.x && absDir.y >= absDir.z) {
        maxAxis = absDir.y;
        u = dir.x;
        v = -dir.z;
        // 上侧面
        i = 2;
    }

    if (!yPositive && absDir.y >= absDir.x && absDir.y >= absDir.z) {
        maxAxis = absDir.y;
        // u = dir.x;
        // v = dir.z;
        u = -dir.x;
        v = -dir.z;
        // 下侧面
        i = 3;
    }

    if (zPositive && absDir.z >= absDir.x && absDir.z >= absDir.y) {
        maxAxis = absDir.z;
        u = dir.x;
        v = dir.y;
        // 前侧面
        i = 4;
    }

    if (!zPositive && absDir.z >= absDir.x && absDir.z >= absDir.y) {
        maxAxis = absDir.z;
        u = -dir.x;
        v = dir.y;
        // 后侧面
        i = 5;
    }

    // 归一化处理，使原始 uv 值符合星图的坐标范围
    // 除以该方向上的最大分量 maxAxis，并将范围映射到 [-1, 1] 区间
    // 加 1 并乘以 0.5，将归一化后的坐标映射到 [0, 1] 区间
    // 将映射到 [0, 1] 区间的坐标乘以 gridSize，以得到在星图中的像素坐标
    // 最后对结果进行向下取整，以确保得到的坐标是整数，适合在数组中索引
    u = Math.floor((u / maxAxis + 1) * 0.5 * gridSize);
    v = Math.floor((v / maxAxis + 1) * 0.5 * gridSize);

    // 计算在starsMap中的索引位置
    const j = (v * gridSize * 6 + i * gridSize + u) * 4;
    starsMap[j] = value[0];
    starsMap[j + 1] = value[1];
    starsMap[j + 2] = value[2];
    starsMap[j + 3] = value[3];
}

export function Start() {
    dither.value = new TextureLoader().load("./src/assets/images/bluenoise.png", function (texture) {
        ditherSize.value.x = texture.image.width;
        ditherSize.value.y = texture.image.height;
        texture.wrapS = RepeatWrapping; // 水平方向上重复的包裹方式
        texture.wrapT = RepeatWrapping; // 垂直方向上重复的包裹方式
    });

    const random = new Random(starsSeed); // 生成星星的位置和颜色

    for (let i = 0; i < starsCount; i++) {
        const a = random.Next() * Math.PI * 2; // 生成随机的经度值（0~2Π）
        const b = random.Next() * 2 - 1; // 生成随机的纬度值（-1~1）
        const c = Math.sqrt(1 - b * b); // 计算纬度对应的半径值
        const target = new Vector3(Math.cos(a) * c, Math.sin(a) * c, b); // 根据球坐标系转换为三维空间中的位置向量

        // 生成随机的颜色值，这里包括了红、绿、蓝和透明度分量
        const color = [
            MathUtils.lerp(0.5 - maxOffset, 0.5 + maxOffset, random.Next()) * 255, // 红色分量
            MathUtils.lerp(0.5 - maxOffset, 0.5 + maxOffset, random.Next()) * 255, // 绿色分量
            Math.pow(random.Next(), 6) * 255, // 蓝色分量
            random.Next() * 255 // 透明度分量
        ]

        // 将星星的位置和颜色映射到星星地图数组中
        Vector3ToStarMap(target, color);
    }

    stars.value = new DataTexture(starsMap, gridSize * 6, gridSize); // 存储星星地图数据的数组
    stars.value.needsUpdate = true; // 标记数据已更新，以便在渲染时使用新数据

    material.vertexShader = vertex; // 顶点着色器
    material.fragmentShader = fragment; // 片段着色器

    intensity = dirToLight.dot(up); // 两向量夹角
    sunVisibility.value = MathUtils.clamp((intensity + 0.1) * 2, 0, 1);
    twilightTime.value = MathUtils.clamp((intensity + 0.1) * 3, 0, 1);
    twilightVisibility.value = 1 - Math.min(Math.abs(intensity * 3), 1);

    // 设置天空盒的统一变量
    SetSkyboxUniforms = function (material) {
        material.uniforms._SkyRotationMatrix = rotationMatrix; // 旋转矩阵
        material.uniforms._DitherTexture = dither; // 抖动纹理
        material.uniforms._DitherTextureSize = ditherSize; // 抖动纹理大小
        material.uniforms._SunVisibility = sunVisibility; // 光照可见度
        material.uniforms._TwilightTime = twilightTime; // 黄昏时间
        material.uniforms._TwilightVisibility = twilightVisibility; // 黄昏可见度
        material.uniforms._GridSize = new Uniform(gridSize); // 网格大小
        material.uniforms._GridSizeScaled = new Uniform(gridSize * 6);
        material.uniforms._Stars = stars; // 星星信息
        material.uniforms._SpecularVisibility = specularVisibility; // 镜面反射可见度
        material.uniforms._DirToLight = new Uniform(dirToLight); // 光照方向
        material.uniforms._Light = light; // 光照颜色
    }
    SetSkyboxUniforms(material);
}

export function Update() {
    intensity = dirToLight.dot(up);
    sunVisibility.value = MathUtils.clamp((intensity + 0.1) * 2, 0, 1);
    twilightTime.value = MathUtils.clamp((intensity + 0.1) * 3, 0, 1);
    twilightVisibility.value = 1 - Math.min(Math.abs(intensity * 3), 1);
    specularVisibility.value = Math.sqrt(sunVisibility.value);
    l = Math.min(sunVisibility.value + 0.333, 1);
    light.value.set(1, 1, 1);
}