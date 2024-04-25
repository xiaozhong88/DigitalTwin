import { Color } from 'three';

const GroupSettings = {
    worldSize: 500
};

var FishSchoolProperty = {
    id: 0,
    cohesion: 0.0, // 凝聚力
    separation: 0.3, // 分离力
    alignment: 0.05, // 对齐力
    moveSpeed: 0.5, // 移动速度
    separationAwareness: 4.2, // 分离意识范围。描述了个体感知其他鱼的范围大小，超出这个范围的鱼将不被考虑在内
    awareness: 25, // 意识范围
    color: new Color(0, 1, 1)
};

let FishActivityRange = [];

function init() {
    for (let i = 0; i < 6; i++) {
        let activityRange = {
            xMin: 0,
            xMax: 0,
            xCen: 0,
            yMin: 0,
            yMax: 0,
            yCen: 0,
            zMin: 0,
            zMax: 0,
            zCen: 0
        };
        FishActivityRange.push(activityRange);
    }
}
init();

export { GroupSettings, FishSchoolProperty, FishActivityRange };