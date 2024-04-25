<template>
    <div id="mBar" class="bg-cover bg-center h-screen text-white p-5 flex overflow-hidden">
        <!-- 左 -->
        <div class="flex-1 mr-5 bg-opacity-50 flex flex-col grid grid-rows-3">
            <!-- 横向柱状图 -->
            <dv-border-box1 class="row-span-1">
                <div class="text-center text-light-300">水体温度</div>
                <Transition name="fade" mode="out-in">
                    <!-- <HorizontalBar v-if="data" :data="data.regionData" /> -->
                    <component :is="WaterTEMPLoading" :data="regionData"></component>
                </Transition>
            </dv-border-box1>
            <!-- 雷达图 -->
            <dv-border-box1 class="row-span-1">
                <div class="text-center text-light-300">水体溶氧量</div>
                <Transition name="fade" mode="out-in">
                    <!-- <RadarBar :data="riskData" /> -->
                    <!-- Dissolved oxygen in water -->
                    <component :is="WaterDOLoading" :data="riskData"></component>
                </Transition>
            </dv-border-box1>
            <!-- 关系图 -->
            <dv-border-box1 class="row-span-1">
                <div class="text-center text-light-300">水体亚硝酸盐含量</div>
                <Transition name="fade" mode="out-in">
                    <!-- <Relation :data="relationData" /> -->
                    <!-- WaterNitriteContent -->
                    <component :is="WaterNITLoading" :data="relationData"></component>
                </Transition>
            </dv-border-box1>
        </div>
        <!-- 中 -->
        <div class="w-1/2 mr-5 flex flex-col bg-opacity-50 grid grid-rows-8">
            <!-- 数据总览图 -->
            <dv-border-box1 class="row-span-3">
                <!-- <TotalData :data="totalData" /> -->
                <Transition name="fade" mode="out-in">
                    <component style="width: 100%;" :is="TotalDataLoading" :data="totalData"></component>
                </Transition>
            </dv-border-box1>
            <!-- 地图可视化 -->
            <!-- <MapChart :data="data.mapData" /> -->
            <div id="control" class="grid row-span-5 pointer-events-auto"></div>
        </div>
        <!-- 右 -->
        <div class="flex-1 bg-opacity-50 flex flex-col grid grid-rows-3">
            <!-- 竖向柱状图 -->
            <dv-border-box1 class="row-span-1">
                <div class="text-center text-light-300">PH值</div>
                <Transition name="fade" mode="out-in">
                    <!-- <VerticalBar :data="serverData" /> -->
                    <component :is="PhValueLoading" :data="serverData"></component>
                </Transition>
            </dv-border-box1>
            <!-- 环形图 -->
            <dv-border-box1 class="row-span-1">
                <div class="text-center text-light-300">水体氨氮含量</div>
                <Transition name="fade" mode="out-in">
                    <!-- <RingBar :data="abnormalData" /> -->
                    <!-- Ammonia nitrogen content in water -->
                    <component :is="WaterTANLoading" :data="abnormalData"></component>
                </Transition>
            </dv-border-box1>
            <!-- 文档云图 -->
            <dv-border-box1 class="row-span-1">
                <div class="text-center text-light-300">水体硫化氢含量</div>
                <Transition name="fade" mode="out-in">
                    <!-- <WordCloud :data="wordCloudData" /> -->
                    <!-- Hydrogen sulfide content in water -->
                    <component :is="WaterH2SLoading" :data="wordCloudData"></component>
                </Transition>
            </dv-border-box1>
            <!-- <div>{{ count }}</div> -->
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, shallowRef, onBeforeUnmount, watch } from "vue";
import WaterTEMP from "./charts/WaterTEMP.vue";
import WaterDO from "./charts/WaterDO.vue";
import WaterNIT from "./charts/WaterNIT.vue";
import TotalData from "./charts/TotalData.vue";
import MapChart from "./charts/MapChart.vue";
import PhValue from "./charts/PhValue.vue";
import WaterTAN from "./charts/WaterTAN.vue";
import WaterH2S from "./charts/WaterH2S.vue";
import Loading from "./Loading.vue";

import { getVisualization } from '~/api/visualization.js';
import * as MQTT from "../api/aliyunMqtt";
import { resizeEcharts, destroyEcharts } from "../utils/allEchart";
// import { BorderBox1, BorderBox2 } from '@dataview/datav-vue3';


const count = ref(0);

const data = ref(null);
const regionData = ref(null);
const riskData = ref(null);
const relationData = ref(null);
const totalData = ref(null);
const serverData = ref(null);
const abnormalData = ref(null);
const wordCloudData = ref(null);

let WaterTEMPLoading = shallowRef(Loading);
let WaterDOLoading = shallowRef(Loading);
let WaterNITLoading = shallowRef(Loading);
let TotalDataLoading = shallowRef(Loading);
let PhValueLoading = shallowRef(Loading);
let WaterTANLoading = shallowRef(Loading);
let WaterH2SLoading = shallowRef(Loading);
// MQTT.Connect();
// const message = ref(null);

const loadData = async () => {
    data.value = await getVisualization();
    regionData.value = data.value.regionData;
    riskData.value = data.value.riskData;
    relationData.value = data.value.relationData;
    totalData.value = data.value.totalData;
    serverData.value = data.value.serverData;
    abnormalData.value = data.value.abnormalData;
    wordCloudData.value = data.value.wordCloudData;
    // console.log(regionData.value)
    // message.value = MQTT.getMessage();
};

let counts = 0;
setInterval(() => {
    loadData();
    if (WaterTEMPLoading.value === Loading) {
        WaterTEMPLoading.value = WaterTEMP;
        counts++;
    }
    if (WaterDOLoading.value === Loading) {
        WaterDOLoading.value = WaterDO;
        counts++;
    }
    if (WaterNITLoading.value === Loading) {
        WaterNITLoading.value = WaterNIT;
        counts++;
    }
    if (TotalDataLoading.value === Loading) {
        TotalDataLoading.value = TotalData;
        counts++;
    }
    if (PhValueLoading.value === Loading) {
        PhValueLoading.value = PhValue;
        counts++;
    }
    if (WaterTANLoading.value === Loading) {
        WaterTANLoading.value = WaterTAN;
        counts++;
    }
    if (WaterH2SLoading.value === Loading) {
        WaterH2SLoading.value = WaterH2S;
        counts++;
    }
    if (counts === 7) {
        resizeEcharts();
        counts = 0;
    }
}, 3000);

onBeforeUnmount(() => {
    destroyEcharts();
    clearInterval();
})

// const boxWidth = ref('100%');
// const boxHeight = ref('100%');
// const componentRef = ref(null);
// watch(componentRef, () => {
//     const component = componentRef.value;
//     if (componentRef.value) {
//         const rect = component.getBoundingClientRect();
//         boxWidth.value = `${rect.width}px`;
//         boxHeight.value = `${rect.height}px`;
//     }
// }, { immediate: true });
</script>

<style>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>