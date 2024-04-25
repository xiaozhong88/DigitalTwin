import { Vector3, Box3, Matrix4, Quaternion, Clock, VectorKeyframeTrack, AnimationClip, AnimationMixer } from "three";
import { FishActivityRange } from "./groupSettings";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader";
import { groups, MainProperties, octrees, spheres, lpPos } from "../../scene/FishPond";
import { inverseSmoothStep } from '../../utils/Math';
import { scene } from "../../Scene";

class Group {
    constructor(model, properties, position) {
        // 基础参数
        this.properties = properties;
        this.hasReproduced = false;
        this.isDed = false;
        this.isEat = false;
        this.direction = null;
        this.mixer = null; // 动画混合器
        this.clock = new Clock();

        // 位置信息
        this.id = this.properties.id;
        this.xRang = Math.abs(FishActivityRange[this.id].xMax - FishActivityRange[this.id].xMin);
        this.zRang = Math.abs(FishActivityRange[this.id].zMax - FishActivityRange[this.id].zMin);
        this.maxRadius = Math.sqrt(
            Math.pow(((FishActivityRange[this.id].xMax - FishActivityRange[this.id].xCen) / (this.xRang / 2)), 2.0) +
            Math.pow(((FishActivityRange[this.id].zMin - FishActivityRange[this.id].zCen) / (this.zRang / 2)), 2.0)
        );
        var xSpawn = FishActivityRange[this.id].xCen + (Math.random() - 0.5) * this.xRang / 2;
        var ySpawn = FishActivityRange[this.id].yCen + (Math.random() - 0.5) * 30;
        var zSpawn = FishActivityRange[this.id].zCen + (Math.random() - 0.5) * this.zRang / 2;
        // 目标位置为 targetPosition
        this.targetPosition = new Vector3(xSpawn, 0, zSpawn);
        if (position != null) {
            xSpawn = position.x;
            ySpawn = position.y;
            zSpawn = position.z;
        }

        // 生成鱼群的随机位置
        this.position = new Vector3(xSpawn, ySpawn, zSpawn);
        this.velocity = new Vector3().randomDirection(); // 速度
        // this.velocity.setLength(Math.random() * (4 - 2) + 2);
        this.velocity.setLength(Math.random());
        this.acceleration = new Vector3(); // 加速度

        // 模型
        this.model = model;
        this.groupMesh = null; // 存储模型的变量
        this.isStopped = false;
        this.stopDuration = 0;
    }

    // 可视角度
    viewingAngle(other) {
        let rads = this.position.angleTo(other);
        return (rads < 3.927 || rads > 5.4978);
    }

    // by adding all the forces together, we can simulate all of them at the same time (just like physics in real life)
    // 通过将所有力加在一起，我们可以同时模拟所有力（就像现实生活中的物理一样）
    flock(fishs) {
        let alignment = this.align(fishs); // 对齐行为
        let cohesion = this.cohesion(fishs); // 凝聚行为
        let separation = this.separation(fishs); // 分离行为
        let avoidance = this.avoidance(fishs); // 规避行为
        let edgeAvoidance = this.edgeAvoidance(); // 边缘规避行为
        this.acceleration.add(separation);
        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(avoidance);
        this.acceleration.add(edgeAvoidance);

        if (spheres[this.id].length > 0) {
            for (const sphere of spheres[this.id]) {
                if (sphere.count > 0 && lpPos[this.id] !== undefined) {
                    let eating = this.eating();
                    this.acceleration.add(eating);
                }
            }
        }
        // if (!this.isEat) {

    }

    // 将每个 boids 与其周围每个 boids 的平均方向对齐
    align(fishs) {
        var avg = new Vector3(0, 0, 0);
        let total = 0; // 周围相同 鱼群 数量
        // 循环遍历附近的每个boid并将自己的方向设置为其他人的平均值
        for (let other of fishs) {
            // 其他物体距离越近，它们对我们方向的影响就越大
            let distance = this.position.distanceTo(other.position);

            if (other != this && distance < this.properties.awareness && this.viewingAngle(other.position)) {
                if (this.properties.id >= other.properties.id) { // 不对齐不同鱼群
                    avg.add(other.velocity);
                    total++;
                }
            }

            // 如果周围有群体
            if (total > 0) {
                avg.divideScalar(total); // 除以样本数求平均值
                avg.setLength(this.properties.moveSpeed);
                avg.sub(this.velocity); // 减去当前速度，以便我们逐渐转向平均值
                avg.clampLength(-this.properties.alignment, this.properties.alignment); // 限制我们的对齐常数之间的长度
            }
        }

        return avg;
    }

    // 聚集到周围群体的平均位置
    cohesion(fishs) {
        var avg = new Vector3(0, 0, 0);
        let total = 0;

        for (let other of fishs) {
            // 其他物体距离越近，它们对我们方向的影响就越大
            let distance = this.position.distanceTo(other.position);

            if (other != this && distance < this.properties.awareness && this.viewingAngle(other.position)) {
                if (this.properties.id >= other.properties.id) { // 不对齐不同鱼群
                    avg.add(other.velocity);
                    total++;
                }
            }

            // 如果周围有群体
            if (total > 0) {
                avg.divideScalar(total); // 除以样本数求平均值
                avg.setLength(this.properties.moveSpeed);
                avg.sub(this.velocity); // 减去当前速度，以便我们逐渐转向平均值
                avg.clampLength(-this.properties.alignment, this.properties.alignment); // 限制我们的对齐常数之间的长度
            }
        }

        return avg;
    }

    // 远离群体以避免碰撞
    separation(fishs) {
        var avg = new Vector3(0, 0, 0);
        let total = 0;

        for (let other of fishs) {
            // 其他物体距离越近，它们对我们方向的影响就越大
            let distance = this.position.distanceTo(other.position);

            if (this.properties.id >= other.properties.id) {
                if (other != this && distance < this.properties.separationAwareness && this.viewingAngle(other.position)) {
                    let diff = new Vector3().subVectors(this.position, other.position); // 距离差
                    avg.add(diff);
                    total++;
                }
            } else { // 远离其他鱼的身体
                if (other != this && distance < this.properties.separationAwareness * 16 && this.viewingAngle(other.position)) {
                    let diff = new Vector3().subVectors(this.position, other.position);
                    diff.divideScalar(distance);
                    avg.add(diff);
                    total++;
                }
            }
        }

        if (total > 0) {
            avg.divideScalar(total);
            avg.setLength(this.properties.moveSpeed);
            avg.sub(this.velocity);
            avg.clampLength(-this.properties.separation, this.properties.separation);
        }

        return avg;
    }

    // 自定义规则，避免靠近其他群体
    avoidance(fishs) {
        var avg = new Vector3();
        let total = 0;

        for (let other of fishs) {
            // 其他物体距离越近，它们对我们方向的影响就越大
            let distance = this.position.distanceTo(other.position);

            if (other != this && distance < this.properties.separationAwareness * 10 && this.viewingAngle(other.position)) {
                if (this.properties.id < other.properties.id) {
                    // 吃婴儿
                    avg.add(new Vector3()
                        .copy(this.velocity) // 创建新的引用（这样我们就不会覆盖）
                        .reflect( // 指向相反的方向
                            new Vector3().subVectors(this.position, other.position).normalize() // 从该 鱼 到其他 鱼 的方向
                        ));
                    total++;
                }
            }
        }

        if (total > 0) {
            avg.divideScalar(total);
            avg.setLength(this.properties.moveSpeed);
            avg.sub(this.velocity);
            avg.clampLength(-this.properties.separation, this.properties.separation);
        }

        return avg;
    }

    // 通过反射避免靠近边缘
    edgeAvoidance() {
        var avg = new Vector3(0, 0, 0);

        const r = inverseSmoothStep(0, 1, ((this.position.y + 100) / 10), this.maxRadius * 0.4, this.maxRadius * 0.68);
        const radius = Math.sqrt(
            Math.pow((this.position.x - FishActivityRange[this.id].xCen) / (this.xRang / 2), 2.0) +
            Math.pow((this.position.z - FishActivityRange[this.id].zCen) / (this.zRang / 2), 2.0));

        // console.log(r - radius)

        if (radius * 1.2 >= r) {

            if (this.position.x < FishActivityRange[this.id].xCen) {
                avg.set(Math.random(), Math.random() / 2 - 0.25, 0);
            }
            if (this.position.x > FishActivityRange[this.id].xCen) {
                avg.set(-Math.random(), Math.random() / 2 - 0.25, 0);
            }
        }
        if (radius * 1 >= r) {
            if (this.position.z < FishActivityRange[this.id].zCen) {
                avg.set(0, Math.random() / 2 - 0.25, Math.random());
            }
            if (this.position.z > FishActivityRange[this.id].zCen) {
                avg.set(0, Math.random() / 2 - 0.25, -Math.random());
            }
        }
        if (this.position.y - 10 <= FishActivityRange[this.id].yMin * 0.9) {
            avg.set(Math.random() - 0.5, 0.8, Math.random() - 0.5);
        }
        if (this.position.y + 10 >= FishActivityRange[this.id].yMax) {
            // avg.set(Math.random() - 0.5, -0.8, Math.random() - 0.5);
            avg.set(Math.random() - 0.5, -0.5, Math.random() - 0.5);
        }

        avg.setLength(this.properties.moveSpeed);
        avg.clampLength(-0.1, 0.1);
        return avg;
    }

    eating() {
        var avg = new Vector3(0, 0, 0);
        this.isEat = true;

        // 计算当前位置到目标位置的向量
        // this.direction = new Vector3().subVectors(this.targetPosition, this.position).normalize();
        this.direction = new Vector3().subVectors(lpPos[this.id], this.position).normalize();

        // 如果物体距离目标位置很近，停止移动
        // if (this.position.distanceTo(this.targetPosition) < 10) {
        if (this.position.distanceTo(lpPos[this.id]) < 10) {
            // this.isEat = false; // 停止移动
            // this.velocity.set(0, 0, 0);
            return avg; // 返回零向量，不进行移动
        }

        // 设置移动方向向量的长度为移动速度
        avg.copy(this.direction).multiplyScalar(this.properties.moveSpeed);

        // 对移动方向向量进行限制，确保不会超出预设的速度范围
        avg.clampLength(-0.1, 0.1);

        return avg; // 返回计算出的移动方向向量
    }

    createGroup(scene) {
        var pos = new Vector3(this.position.x, this.position.y, this.position.z);

        // var promise;
        // if (this.loader == null) {
        //     // 加载模型
        //     const dracoLoader = new DRACOLoader();
        //     dracoLoader.setDecoderPath('/public/draco/gltf/');
        //     dracoLoader.setDecoderConfig({ type: 'js' });
        //     this.loader = new GLTFLoader();
        //     this.loader.setDRACOLoader(dracoLoader);
        //     promise = this.loader.loadAsync('/public/assets/Fish.glb');
        // }

        // 计数+1
        MainProperties.numGroups++;
        // 等待加载完成对模型进行处理
        try {
            // 获取模型的第一个网格
            const mesh = this.model.clone().children[0];
            // 计算鱼模型的包围盒
            var bbox = new Box3().setFromObject(mesh);
            // 变量以调整并重新定位网格位置
            var center = new Vector3();
            var size = new Vector3();
            bbox.getCenter(center);
            bbox.getSize(size);
            mesh.rotateX(Math.PI / 2);
            // 缩放个平移矩阵
            var sca = new Matrix4();
            var tra = new Matrix4();
            // 应用变换和缩放变量到矩阵
            var scaleFact = 7 / size.length();
            sca.makeScale(scaleFact, scaleFact, scaleFact);
            tra.makeTranslation(-center.x, -center.y, -bbox.min.z);
            // 应用矩阵到网格
            mesh.applyMatrix4(tra);
            mesh.applyMatrix4(sca);
            // 使鱼网格面向 X 轴
            mesh.rotation.x = Math.PI / 2;
            // 将网格放置到位置
            mesh.position.set(pos.x, pos.y, pos.z);
            // 将网格添加到场景
            scene.add(mesh);

            // 将模型赋值给 this.groupMesh
            this.groupMesh = mesh;

            const axisDirectionXY1 = new Vector3(1, 1, 0).sub(new Vector3(1, 0, 0)).normalize();
            const axisDirectionXY2 = new Vector3(1, 0, 1).sub(new Vector3(1, 0, 0)).normalize();
            // 定义鱼尾动画函数
            // function animateTail() {

            //     const time = performance.now() * 0.001;
            //     const angle = Math.sin(time * 5) * Math.PI / 64;

            //     const quaternion1 = new Quaternion().setFromAxisAngle(axisDirectionXY1, angle);
            //     const quaternion2 = new Quaternion().setFromAxisAngle(axisDirectionXY2, angle);
            //     const combinedQuaternion = new Quaternion();
            //     combinedQuaternion.multiplyQuaternions(quaternion1, quaternion2);
            //     mesh.quaternion.copy(combinedQuaternion);

            //     requestAnimationFrame(animateTail);
            // }
            // animateTail();

            var duration = 2; // 动画持续时间（毫秒）
            var swingAmount = Math.PI / 36; // 摆动幅度
            // 创建关键帧动画轨道
            var times = [0, duration / 4, duration / 4 * 3, duration]; // 一个摆动周期
            var valuesZ = [0, swingAmount, -swingAmount, 0]; // Z 轴方向的旋转角度
            var valuesY = [0, swingAmount / 2, -swingAmount / 2, 0]; // Y 轴方向的旋转角度
            var rotationKFZ = new VectorKeyframeTrack('.rotation[z]', times, valuesZ);
            var rotationKFY = new VectorKeyframeTrack('.rotation[y]', times, valuesY);
            const tracks = [rotationKFZ, rotationKFY];
            const clip = new AnimationClip("SwingAnimation", -1, tracks);
            this.mixer = new AnimationMixer(this.groupMesh);
            const action = this.mixer.clipAction(clip);
            action.play();
        } catch (error) {
            console.error('An error occurred while loading the model:', error);
        };
        // return promise.then((gltf) => {
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

        //     // 将模型赋值给 this.groupMesh
        //     this.groupMesh = mesh;

        //     const axisDirectionXY1 = new Vector3(1, 1, 0).sub(new Vector3(1, 0, 0)).normalize();
        //     const axisDirectionXY2 = new Vector3(1, 0, 1).sub(new Vector3(1, 0, 0)).normalize();
        //     // 定义鱼尾动画函数
        //     function animateTail() {
        //         console.log(mesh.position.x);

        //         const time = performance.now() * 0.001;
        //         const angle = Math.sin(time * 5) * Math.PI / 64;

        //         const quaternion1 = new Quaternion().setFromAxisAngle(axisDirectionXY1, angle);
        //         const quaternion2 = new Quaternion().setFromAxisAngle(axisDirectionXY2, angle);
        //         const combinedQuaternion = new Quaternion();
        //         combinedQuaternion.multiplyQuaternions(quaternion1, quaternion2);
        //         mesh.quaternion.copy(combinedQuaternion);

        //         requestAnimationFrame(animateTail);
        //     }
        //     animateTail();
        // }).catch(function (error) {
        //     console.error('An error occurred while loading the model:', error);
        // });
    }

    update(fishs) {
        this.mixer.update(this.clock.getDelta());

        this.velocity.add(this.acceleration);
        this.velocity.clampLength(-this.properties.moveSpeed, this.properties.moveSpeed); // 限制向量的长度，使其不会比移动速度快
        // 检查速度是否超过最大速度
        const currentSpeed = this.velocity.length();
        if (currentSpeed > this.properties.moveSpeed) {
            // 计算速度缩放因子，将速度缩小至最大速度
            const scaleFactor = this.properties.moveSpeed / currentSpeed * 0.8;
            this.velocity.multiplyScalar(scaleFactor);
        }
        // if (this.groupMesh != null) {
        //     this.groupMesh.position.set(this.position.x, this.position.y, this.position.z); // 更新位置
        //     this.acceleration.set(0, 0, 0); // 重设加速度
        //     var dir = new Vector3().copy(this.position).add(this.velocity);
        //     this.groupMesh.lookAt(dir);
        // }
        // 模拟随机停止
        if (this.isStopped) { // 如果鱼当前处于停止状态
            this.stopDuration--; // 减少停止持续时间
            if (this.stopDuration <= 0) { // 如果停止持续时间已经结束
                this.isStopped = false; // 设置停止状态为 false，即恢复运动
                if (Math.random() < 0.8) { // 随机决定是否改变运动方向
                    // 随机选择一个方向，并施加速度
                    const randomDirection = new Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
                    randomDirection.normalize();
                    this.velocity.copy(randomDirection).multiplyScalar(this.properties.moveSpeed);
                }
            }
        } else { // 如果鱼当前处于运动状态
            // 模拟随机停止
            if (Math.random() < 0.01) { // 设定一个随机停止的概率，可以根据需要调整
                this.isStopped = true; // 设置停止状态为 true
                // this.stopDuration = Math.floor(Math.random() * 100) + 50; // 随机设置停止持续时间
                this.stopDuration = Math.floor(Math.random() * 3);
                // 清除加速度,速度设为很小的值
                this.acceleration.set(0, 0, 0);
                this.velocity.set(Math.random() * 0.1 - 0.05, Math.random() * 0.1 - 0.05, Math.random() * 0.1 - 0.05);
                // const tinyVelocity = new Vector3(Math.random() * 0.1 - 0.05, Math.random() * 0.1 - 0.05, Math.random() * 0.1 - 0.05);
                // this.velocity.copy(tinyVelocity);
            }
        }
        // 方1
        // if (spheres.length === 0) {
        if (spheres.length > 0 && spheres[this.id].length > 0 && this.isEat) {
            const allCountsZero = spheres[this.id].every(sphere => sphere.count === 0);
            if (allCountsZero) {
                this.isEat = false;

                this.acceleration.add(new Vector3(Math.random() - 0.5, -1, Math.random() - 0.5).setLength(this.properties.moveSpeed).clampLength(-0.1, 0.1));
                this.velocity.add(this.acceleration);
                this.velocity.clampLength(-this.properties.moveSpeed, this.properties.moveSpeed); // 限制向量的长度，使其不会比最大移动速度快
                // 检查速度是否超过最大速度
                const currentSpeed = this.velocity.length();
                if (currentSpeed > this.properties.moveSpeed) {
                    // 计算速度缩放因子，将速度缩小至最大速度
                    const scaleFactor = this.properties.moveSpeed / currentSpeed * 0.8;
                    this.velocity.multiplyScalar(scaleFactor);
                }
            }
        }
        // 继续按原方向运动
        if (this.groupMesh != null && !this.isStopped) { // 如果不处于停止状态才进行移动，避免原地看向
            this.groupMesh.position.set(this.position.x, this.position.y, this.position.z); // 更新位置
            var dir = new Vector3().copy(this.position).add(this.velocity);
            this.groupMesh.lookAt(dir);
        }
        this.position.add(this.velocity); // update reference position / 更新参考位置

        for (let other of fishs) {
            let distance = this.position.distanceTo(other.position);
            if (other != this && this.properties.id < other.properties.id && !other.isDed && distance <= 3) {
                scene.remove(this.groupMesh);
                MainProperties.numGroups--; // 减一个鱼群数量
                this.groupMesh = null;
                this.position = new Vector3(-1000000, 1000000, 1000000);
                this.isDed = true;
                break;
            } else if (!this.hasReproduced &&
                other != this &&
                this.properties.id === other.properties.id &&
                !other.isDed &&
                MainProperties.numGroups < MainProperties.maxFishs &&
                distance <= 0.5) {
                let newGroup = new Group(this.properties);
                newGroup.createGroup(scene);
                groups.push(newGroup);
                octrees[this.id].insert(newGroup);
                this.hasReproduced = true;
                break;
            }
        }
    }
}

export { Group };