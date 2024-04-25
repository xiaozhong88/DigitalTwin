import { Box } from "./box";

class Octree {
    constructor(bounds, capacity) {
        this.bounds = bounds; // 区域
        this.capacity = capacity; // 细分之前的 groups 数量
        this.points = []; // 此框中的 groups 列表
        this.children = null;
    }

    // 细分区域
    subdivide() {
        const x = this.bounds.x;
        const y = this.bounds.y;
        const z = this.bounds.z;
        const w = this.bounds.width / 2;
        const h = this.bounds.height / 2;
        const d = this.bounds.depth / 2;

        // 创建具有新位置和尺寸的子框
        this.children = [
            new Octree(new Box(x, y, z, w, h, d), this.capacity),
            new Octree(new Box(x + w, y, z, w, h, d), this.capacity),
            new Octree(new Box(x, y + h, z, w, h, d), this.capacity),
            new Octree(new Box(x + w, y + h, z, w, h, d), this.capacity),
            new Octree(new Box(x, y, z + d, w, h, d), this.capacity),
            new Octree(new Box(x + w, y, z + d, w, h, d), this.capacity),
            new Octree(new Box(x, y + h, z + d, w, h, d), this.capacity),
            new Octree(new Box(x + w, y + h, z + d, w, h, d), this.capacity)
        ];
    }

    insert(point) {
        if (!this.bounds.contains(point.position)) {
            return false;
        }

        if (this.points.length < this.capacity) {
            this.points.push(point);
            return true;
        }

        if (!this.children) {
            this.subdivide();
        }

        for (const child of this.children) {
            if (child.insert(point)) {
                return true;
            }
        }

        return false;
    }

    query(range, found = []) {
        if (!this.bounds.intersects(range)) {
            return found;
        }

        // 添加此框中存在的所有 groups
        for (const point of this.points) {
            if (range.contains(point.position)) {
                found.push(point);
            }
        }

        // 存在子树时，继续进行
        if (this.children) {
            for (const child of this.children) {
                child.query(range, found);
            }
        }

        return found;
    }
}

export { Octree };