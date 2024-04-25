import { Vector2, Vector3 } from "three";
import { renderer } from "../Scene.js";
import { time } from "../utils/Time.js";
import { onMounted } from "vue";

class Pointer {
    id = 0;
    phase = 0;
    position = new Vector2();
    deltaPosition = new Vector2();
    type = "";

    constructor(id, phase, position, deltaPosition, type) {
        this.id = id;
        this.phase = phase;
        this.position.copy(position);
        this.deltaPosition.copy(deltaPosition);
        this.type = type;
    }

    clone() {
        return new Pointer(this.id, this.phase, this.position, this.deltaPosition, this.type);
    }
}

export class PointerPhase {
    static began = 0;
    static stationary = 1;
    static moved = 2;
    static ended = 3;
    static cancelled = 4;
}

export class PointerType {
    static mouse = "mouse";
    static pen = "pen";
    static touch = "touch";
}

export class KeyCodes {
    static escape = "Escape";
    static f1 = "F1";
    static f2 = "F2";
    static f3 = "F3";
    static f4 = "F4";
    static f5 = "F5";
    static f6 = "F6";
    static f7 = "F7";
    static f8 = "F8";
    static f9 = "F9";
    static f10 = "F10";
    static f11 = "F11";
    static f12 = "F12";

    static digit0 = "Digit0";
    static digit1 = "Digit1";
    static digit2 = "Digit2";
    static digit3 = "Digit3";
    static digit4 = "Digit4";
    static digit5 = "Digit5";
    static digit6 = "Digit6";
    static digit7 = "Digit7";
    static digit8 = "Digit8";
    static digit9 = "Digit9";

    static keyQ = "KeyQ";
    static keyW = "KeyW";
    static keyE = "KeyE";
    static keyR = "KeyR";
    static keyT = "KeyT";
    static keyY = "KeyY";
    static keyU = "KeyU";
    static keyI = "KeyI";
    static keyO = "KeyO";
    static keyP = "KeyP";
    static keyA = "KeyA";
    static keyS = "KeyS";
    static keyD = "KeyD";
    static keyF = "KeyF";
    static keyG = "KeyG";
    static keyH = "KeyH";
    static keyJ = "KeyJ";
    static keyK = "KeyK";
    static keyL = "KeyL";
    static keyZ = "KeyZ";
    static keyX = "KeyX";
    static keyC = "KeyC";
    static keyV = "KeyV";
    static keyB = "KeyB";
    static keyN = "KeyN";
    static keyM = "KeyM";

    static shiftLeft = "ShiftLeft";
    static controlLeft = "ControlLeft";
    static space = "Space";

    static arrowUp = "ArrowUp";
    static arrowRight = "ArrowRight";
    static arrowDown = "ArrowDown";
    static arrowLeft = "ArrowLeft";
}

export let keysPressed = new Array(); // 当前被按下键的键码
export let keysJustPressed = new Array(); // 最近一帧中被按下键的键码
export let pointers = new Array(); // 当前活动的指针对象
export let mouseMovement = new Vector2(); // 存储最近一帧中鼠标的位移向量
export let lastPointerLockChange = -2; // 最后一次指针锁定状态的改变时间
export let lastFullscreenChange = 0; // 最后一次全屏状态的改变时间

let keysPressedCopy = new Array();
let pointersCopy = new Array();
let mouseMovementCopy = new Vector2();

function IndexOfId(array, id) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].id == id) {
            return i;
        }
    }
    return -1;
}

export function Start() {
    document.addEventListener("keydown", function (e) {
        if (!keysPressed.includes(e.code)) {
            keysPressed.push(e.code);
        }
    });

    document.addEventListener("keyup", function (e) {
        keysPressed.splice(keysPressed.indexOf(e.code), 1);
    });

    // 菜单
    document.addEventListener("pointerlockchange", function () {
        if (!document.pointerLockElement) {
            // openMenu();
        }
        lastPointerLockChange = time;
        keysPressed = new Array();
    });

    // 全屏
    document.addEventListener("fullscreenchange", function () {
        // FullscreenUpdate();
        lastFullscreenChange = time;
        keysPressed = new Array();
    });

    document.addEventListener("mousemove", function (e) {
        if (document.pointerLockElement) {
            // 浏览器坐标系的 Y 轴方向与常规的笛卡尔坐标系相反
            mouseMovement.add(new Vector2(e.movementX, -e.movementY));
        }
    });

    // onMounted(() => {
    //     console.log('object :>> ', document.getElementById('app'));
    //     document.getElementById('app').addEventListener("pointerdown", (e) => {
    //         console.log('点击了');
    //         let i = IndexOfId(pointers, e.pointerId);
    //         if (i < 0) {
    //             pointers.push(new Pointer(e.pointerId, PointerPhase.began, new Vector2(e.clientX, e.clientY), new Vector2(), e.pointerType));
    //         } else {
    //             let pointer = pointers[i].clone();
    //             pointer.phase = PointerPhase.began;
    //             pointers[i] = pointer;
    //         }
    //     });

    //     document.getElementById('app').addEventListener("pointermove", function (e) {
    //         let i = IndexOfId(pointers, e.pointerId);
    //         if (i >= 0) {
    //             let phase = pointers[i].phase;
    //             if (phase == PointerPhase.began || phase == PointerPhase.ended || phase == PointerPhase.cancelled) {
    //                 return;
    //             }

    //             let pointer = pointers[i].clone();
    //             pointer.phase = PointerPhase.moved;
    //             pointer.position.setX(e.clientX);
    //             pointer.position.setY(e.clientY);
    //             pointers[i] = pointer;
    //         }
    //     });

    //     document.getElementById('app').addEventListener("pointerup", function (e) {
    //         let i = IndexOfId(pointers, e.pointerId);
    //         if (i >= 0) {
    //             let pointer = pointers[i].clone();
    //             pointer.phase = PointerPhase.ended;
    //             pointers[i] = pointer;
    //         }
    //     });

    //     document.getElementById('app').addEventListener("pointercancel", function (e) {
    //         let i = IndexOfId(pointers, e.pointerId);
    //         if (i >= 0) {
    //             let pointer = pointers[i].clone();
    //             pointer.phase = PointerPhase.cancelled;
    //             pointers[i] = pointer;
    //         }
    //     });

    //     document.getElementById('app').addEventListener("pointerdown", function (e) {
    //         e.target.releasePointerCapture(e.pointerId);
    //     })
    // })

    // 鼠标点击事件
    // renderer.domElement.addEventListener("pointerdown", (e) => {
    //     let i = IndexOfId(pointers, e.pointerId);
    //     if (i < 0) {
    //         pointers.push(new Pointer(e.pointerId, PointerPhase.began, new Vector2(e.clientX, e.clientY), new Vector2(), e.pointerType));
    //     } else {
    //         let pointer = pointers[i].clone();
    //         pointer.phase = PointerPhase.began;
    //         pointers[i] = pointer;
    //     }
    // });

    onMounted(() => {
        // console.log(document.childNodes[1].childNodes[2].querySelector('#app').querySelector('#mBar'))
        // console.log(document.getElementById('app').querySelector('#mBar'))
        // console.log(document.getElementById('app'))
        // console.log(document.getElementById('app').querySelector('#btn'))

        // document.getElementById('app').querySelector('#mBar').addEventListener("pointerdown", (e) => {
        //     console.log('点击了');

        //     let i = IndexOfId(pointers, e.pointerId);
        //     if (i < 0) {
        //         pointers.push(new Pointer(e.pointerId, PointerPhase.began, new Vector2(e.clientX, e.clientY), new Vector2(), e.pointerType));
        //     } else {
        //         let pointer = pointers[i].clone();
        //         pointer.phase = PointerPhase.began;
        //         pointers[i] = pointer;
        //     }
        // });

        // document.getElementById('app').querySelector('#btn').removeEventListener("pointerdown", (e) => {

        // });
        // document.getElementById('app').querySelector('#btn').addEventListener("pointerdown", (e) => {
        //     console.log("按钮点击了")
        // });

        document.getElementById('app').querySelector('#control').addEventListener("pointerdown", (e) => {
            console.log('点击了');

            let i = IndexOfId(pointers, e.pointerId);
            if (i < 0) {
                pointers.push(new Pointer(e.pointerId, PointerPhase.began, new Vector2(e.clientX, e.clientY), new Vector2(), e.pointerType));
            } else {
                let pointer = pointers[i].clone();
                pointer.phase = PointerPhase.began;
                pointers[i] = pointer;
            }
        });

        // document.getElementById('app').querySelector('#btn').addEventListener("pointerdown", (e) => {
        //     console.log('按钮点击了')
        // });
    });
    // console.log(document.childNodes[1].childNodes[2].querySelector('#app').querySelector('#mBar'))
    // document.addEventListener("pointerdown", (e) => {
    //     console.log('点击了');
    //     let i = IndexOfId(pointers, e.pointerId);
    //     if (i < 0) {
    //         pointers.push(new Pointer(e.pointerId, PointerPhase.began, new Vector2(e.clientX, e.clientY), new Vector2(), e.pointerType));
    //     } else {
    //         let pointer = pointers[i].clone();
    //         pointer.phase = PointerPhase.began;
    //         pointers[i] = pointer;
    //     }
    // });

    document.addEventListener("pointermove", function (e) {
        let i = IndexOfId(pointers, e.pointerId);
        if (i >= 0) {
            let phase = pointers[i].phase;
            if (phase == PointerPhase.began || phase == PointerPhase.ended || phase == PointerPhase.cancelled) {
                return;
            }

            let pointer = pointers[i].clone();
            pointer.phase = PointerPhase.moved;
            pointer.position.setX(e.clientX);
            pointer.position.setY(e.clientY);
            pointers[i] = pointer;
        }
    });

    document.addEventListener("pointerup", function (e) {
        let i = IndexOfId(pointers, e.pointerId);
        if (i >= 0) {
            let pointer = pointers[i].clone();
            pointer.phase = PointerPhase.ended;
            pointers[i] = pointer;
        }
    });

    document.addEventListener("pointercancel", function (e) {
        let i = IndexOfId(pointers, e.pointerId);
        if (i >= 0) {
            let pointer = pointers[i].clone();
            pointer.phase = PointerPhase.cancelled;
            pointers[i] = pointer;
        }
    });

    document.addEventListener("pointerdown", function (e) {
        e.target.releasePointerCapture(e.pointerId);
    })
}

export function Update() {

    mouseMovement.sub(mouseMovementCopy);
    mouseMovementCopy.copy(mouseMovement);

    for (let i = 0; i < pointersCopy.length; i++) {
        let pointerCopy = pointersCopy[i].clone();
        let j = IndexOfId(pointers, pointerCopy.id);

        if (pointerCopy.phase == PointerPhase.ended || pointerCopy.phase == PointerPhase.cancelled) {
            pointers.splice(j, 1);
        }
    }

    for (let i = 0; i < pointers.length; i++) {
        let pointer = pointers[i].clone();
        let j = IndexOfId(pointersCopy, pointer.id);

        if (j >= 0) {
            pointer.deltaPosition = pointer.position.clone().sub(pointersCopy[j].position);

            if (pointer.phase != PointerPhase.ended && pointer.phase != PointerPhase.cancelled && pointer.deltaPosition.lengthSq() == 0) {
                pointer.phase = PointerPhase.stationary;
            }
        }
        else {
            pointer.phase = PointerPhase.began;
        }

        pointers[i] = pointer;
    }

    pointersCopy = new Array();
    for (let i = 0; i < pointers.length; i++) {
        pointersCopy[i] = pointers[i].clone();
    }

    for (let i = 0; i < keysPressed.length; i++) {
        let key = keysPressed[i];

        if (!keysPressedCopy.includes(key)) {
            keysJustPressed.push(key);
        }
        else if (keysJustPressed.includes(key)) {
            keysJustPressed.splice(keysJustPressed.indexOf(key), 1);
        }
    }

    keysPressedCopy = new Array(...keysPressed);
}