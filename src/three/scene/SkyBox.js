import { BufferAttribute, BufferGeometry, MathUtils, Matrix3, Mesh, Uniform, Vector3 } from "three";
import * as skyboxMaterial from "~/three/materials/SkyboxMaterial.js";
import { deltaTime } from "../utils/Time.js";
import { camera } from "../Scene.js";

export const skybox = new Mesh();
export const dirToLight = new Vector3(); // 光照方向的向量
export const rotationMatrix = new Uniform(new Matrix3()); // 旋转矩阵对象

const halfSize = 2000; // 天空盒的半尺寸
const speed = 0.05; // 旋转速度
const initial = new Vector3(0, 1, 0); // 初始方向向量
const axis = new Vector3(0, 0, 1).applyAxisAngle(new Vector3(0, 1, 0), MathUtils.degToRad(-30)); // 旋转抽向量
let angle = -1; // 初始旋转角度

// 根据给定的角度设置旋转矩阵
function setSkyRotationMatrix(angle) {
    const cos = Math.cos(angle);
    const cos1 = 1 - cos;
    const sin = Math.sin(angle);
    const u = axis;
    const u2 = axis.clone().multiply(axis);
    // "缩放因子"指的是通过旋转矩阵对向量或物体进行缩放的量。它描述了旋转操作对坐标轴上的尺寸的影响。
    // "缩放和旋转的组合效果"表示了旋转操作对向量或物体的综合影响。旋转可以改变向量或物体的方向和形状，而缩放可以改变其尺寸。
    // x轴上的缩放因子，y轴上的缩放与旋转的组合效果，z轴上的缩放与旋转的组合效果
    // x轴上的缩放与旋转的组合效果，y轴上的缩放因子，z轴上的缩放与旋转的组合效果
    // x轴上的缩放与旋转的组合效果，y轴上的缩放与旋转的组合效果，z轴上的缩放因子

    // 假设要绕一个单位向量 u（即旋转轴）进行旋转，旋转角度为 θ
    // 二维：R = [[cos(θ), -sin(θ)], [sin(θ), cos(θ)]]
    // 三维：c = cos(θ) s = sin(θ)
    // R = [[c+x^2(1-c), xy(1-c)-zs, xz(1-c)+ys], [xy(1-c)+zs, c+y^2(1-c), yz(1-c)-xs], [xz(1-c)-ys, yz(1-c)+xs, c+z^2(1-c)]]
    rotationMatrix.value.set(
        cos + u2.x * cos1,             u.x * u.y * cos1 - u.z * sin,  u.x * u.z * cos1 + u.y * sin,
        u.y * u.x * cos1 + u.z * sin,  cos + u2.y * cos1,             u.y * u.z * cos1 - u.x * sin,
        u.z * u.x * cos1 - u.y * sin,  u.z * u.y * cos1 + u.x * sin,  cos + u2.z * cos1
    );
}

export function Start() {
    dirToLight.copy(initial);
    skyboxMaterial.Start();

    // 顶点数组
    const vertices = new Float32Array([
        -halfSize, -halfSize, -halfSize,  // 左下内
        halfSize, -halfSize, -halfSize,   // 右下内
        -halfSize, -halfSize, halfSize,   // 左下外
        halfSize, -halfSize, halfSize,    // 右下外

        -halfSize, halfSize, -halfSize,   // 左上内
        halfSize, halfSize, -halfSize,    // 右上内
        -halfSize, halfSize, halfSize,    // 左上外
        halfSize, halfSize, halfSize      // 右上外
    ]);

    // 索引数组
    const indices = [
        2, 3, 0, 3, 1, 0,  // 底面
        0, 1, 4, 1, 5, 4,  // 后侧面
        1, 3, 5, 3, 7, 5,  // 右侧面
        3, 2, 7, 2, 6, 7,  // 前侧面
        2, 0, 6, 0, 4, 6,  // 左侧面
        4, 5, 6, 5, 7, 6   // 顶面
    ];

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(vertices, 3)); // 顶点位置信息
    geometry.setAttribute("coord", new BufferAttribute(vertices, 3)); // 顶点纹理坐标信息
    geometry.setIndex(indices);

    skybox.geometry = geometry;
    skybox.material = skyboxMaterial.material;

    // 旋转天空盒和光源方向
    setSkyRotationMatrix(angle);
    initial.applyMatrix3(rotationMatrix.value);
    dirToLight.set(-initial.x, initial.y, -initial.z);
    initial.set(0, 1, 0);
}

export function Update() {
    angle += deltaTime * speed;
    setSkyRotationMatrix(angle);
    initial.applyMatrix3(rotationMatrix.value);
    dirToLight.set(-initial.x, initial.y, -initial.z);
    initial.set(0, 1, 0);
    skyboxMaterial.Update();
    // 将天空盒的位置设置为相机的位置，实现跟随移动的效果，确保视觉上的连续性和一致性，增强场景的真实感
    skybox.position.copy(camera.position);
}