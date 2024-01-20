<template>
    <div v-if="data" class="bg-cover bg-center h-screen text-white p-5 flex overflow-hidden">
        <!-- 左 -->
        <div class="flex-1 mr-5 bg-opacity-50 flex flex-col mb-7 h-max-full">
            <!-- 横向柱状图 -->
            <dv-border-box1>
                <HorizontalBar :data="data.regionData" />
            </dv-border-box1>
            <!-- 雷达图 -->
            <dv-border-box1>
                <RadarBar :data="data.riskData" />
            </dv-border-box1>
            <!-- 关系图 -->
            <dv-border-box1>
                <Relation :data="data.relationData" />
            </dv-border-box1>
        </div>
        <!-- 中 -->
        <div class="w-1/2 mr-5 flex flex-col bg-opacity-50 p-1">
            <!-- 数据总览图 -->
            <dv-border-box1 class="bg-slate-800" style="height: min-content;">
                <TotalData :data="data.totalData" />
            </dv-border-box1>
            <!-- 地图可视化 -->
            <MapChart :data="data.mapData" />
        </div>
        <!-- 右 -->
        <div class="flex-1 bg-opacity-50 flex flex-col mb-7 h-max-full">
            <!-- 竖向柱状图 -->
            <dv-border-box1>
                <VerticalBar :data="data.serverData" />
            </dv-border-box1>
            <!-- 环形图 -->
            <dv-border-box1>
                <RingBar :data="data.abnormalData" />
            </dv-border-box1>
            <!-- 文档云图 -->
            <dv-border-box1>
                <WordCloud :data="data.wordCloudData" />
            </dv-border-box1>
            <!-- <div>{{ count }}</div> -->
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import HorizontalBar from "./charts/HorizontalBar.vue";
import RadarBar from "./charts/RadarBar.vue";
import Relation from "./charts/Relation.vue";
import TotalData from "./charts/TotalData.vue";
import MapChart from "./charts/MapChart.vue";
import VerticalBar from "./charts/VerticalBar.vue";
import RingBar from "./charts/RingBar.vue";
import WordCloud from "./charts/WordCloud.vue";

import { getVisualization } from '~/api/visualization.js';
import * as MQTT from "../api/aliyunMqtt";
// import { BorderBox1, BorderBox2 } from '@dataview/datav-vue3';


const count = ref(0);

const data = ref(null);
// MQTT.Connect();
// const message = ref(null);

const loadData = async () => {
    data.value = await getVisualization();
    // console.log(data.value)
    // message.value = MQTT.getMessage();
};
setInterval(() => {
    loadData();
}, 3000);


</script>

<style></style>