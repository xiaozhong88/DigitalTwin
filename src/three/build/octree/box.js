// 八叉树包含盒子，盒子用于从八叉树中采样区域
class Box {
    constructor(x, y, z, width, height, depth) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.width = width;
        this.height = height;
        this.depth = depth;
    }

    // 包含
    contains(point) {
        return (
            point.x >= this.x &&
            point.x <= this.x + this.width &&
            point.y >= this.y &&
            point.y <= this.y + this.height &&
            point.z >= this.z &&
            point.z <= this.z + this.depth
        );
    }

    // 如果此框可以检测到 in 中的另一个框，则返回 true
    intersects(other) {
        return !(
            other.x > this.x + this.width ||
            other.x + other.width < this.x ||
            other.y > this.y + this.height ||
            other.y + other.height < this.y ||
            other.z > this.z + this.depth ||
            other.z + other.depth < this.z
        );
        // return (
        //     other.x < this.x + this.width &&
        //     other.x + other.width > this.x &&
        //     other.y < this.y + this.height &&
        //     other.y + other.height > this.y &&
        //     other.z < this.z + this.depth &&
        //     other.z + other.depth > this.z
        // );
    }
}

export { Box };