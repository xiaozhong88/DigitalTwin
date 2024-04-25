/**
 * CurveCalc
 * 曲线计算
 */
function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

function smoothStep(edge0, edge1, x) {
    // 计算插值
    const t = Math.max(0, Math.min((x - edge0) / (edge1 - edge0), 1));
    // 应用平滑步阶函数
    return t * t * (3 - 2 * t);
}

function smoothStepFlip(edge0, edge1, x) {
    // 计算插值
    const t = Math.max(0, Math.min((edge1 - x) / (edge1 - edge0), 1));
    // 应用平滑步阶函数
    return t * t * (3 - 2 * t);
}

function inverseSmoothStep(edge0, edge1, height, innerRadius, outerRadius, hRange = 15) {
    let low = 0;
    let high = 1;
    const epsilon = 0.0001; // 精度控制

    // 二分查找
    while (high - low > epsilon) {
        const mid = (low + high) / 2;
        const smoothedHeight = smoothStep(edge0, edge1, mid) * hRange;

        if (smoothedHeight < height) {
            low = mid;
        } else {
            high = mid;
        }
    }

    // 返回半径
    return innerRadius + (outerRadius - innerRadius) * low;
}

/**
 * 判断点是否在多边形内
 * @param {*} ref 点
 * @param {*} poly 多边形顶点
 * @returns 
 */
function pointInPolygon(ref, poly) {
    let n = poly.length;
    let count = 0;

    if (n === 0) {
        return false;
    }

    for (let i = 0, j = n - 1; i < n; j = i++) {
        let start = poly[i];
        let end = poly[j];
        // 点与多边形的顶点重合
        if ((start.x === ref.x && start.y === ref.y) || (end.x === ref.x && end.y === ref.y)) {
            return true;
        }
        // 判断线段两端点是否在射线两侧
        if ((ref.y >= start.y && ref.y < end.y) || (ref.y >= end.y && ref.y < start.y)) {
            // 线段上与射线 Y 坐标相同的点的 X 坐标
            let x = start.x + (ref.y - start.y) * (end.x - start.x) / (end.y - start.y);
            // 点在多边形的边上
            if (ref.x === x) {
                return true; // onside
            }
            // 射线穿过多边形的边界
            if (x > ref.x) {
                count++;
            }
        }
    }
    // 射线穿过多边形边界的次数为奇数时点在多边形内
    return count % 2 !== 0;
}

export { sigmoid, smoothStep, smoothStepFlip, inverseSmoothStep, pointInPolygon };