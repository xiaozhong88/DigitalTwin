import mqtt from "mqtt";

let client;
let message = '';

// 设备证书信息
const productKey = '';
const deviceName = '';
const deviceSecret = '';

// 新版公共实例需要填写实例ID，旧版不用
const instanceId = '';

// 当前产品和设备所属地域的ID
const region = 'cn-shanghai';

// 连接参数
let options = {
    connectTimeout: 4000, // 超时时间
    clientId: "", // 设备id
    username: "", // 用户名
    password: "", // 密码
    cleanSession: false, // 是否清除session
    keepAlive: 60 // 心跳值，太大可能会连接不成功
}

// 连接域名
const brokeUrl = instanceId
    ? `wss://${instanceId}.mqtt.iothub.aliyuncs.com:443`
    : `wss://${productKey}.iot-as-mqtt.${region}.aliyuncs.com:443`;

// 监听connect事件，建立MQTT连接，订阅自定义Topic，通过自定义Topic向物联网平台发送信息
function linkMqtt() {
    client.on("connect", (e) => {
        console.log("连接成功");
        client.subscribe(
            "", // 订阅的主题
            { qos: 0 }, // 服务质量：0 最多交付一次 1 至少交付一次 2 只交付一次
            (error) => {
                console.log('error');
            }
        );
    });
};

export function Connect() {
    client = mqtt.connect(
        brokeUrl,
        options
    );
    // 订阅主题
    linkMqtt();
    client.on('error', (error) => {
        console.log("连接出错", error);
    });
    client.on("message", (topic, msg) => {
        message = msg.toString();
        console.log(`${msg.toString()}`);
    });
}

export function getMessage() {
    return message;
};

export function disconnect() {
    if (client.end) {
        client.end();
        console.log("断开");
    }
};