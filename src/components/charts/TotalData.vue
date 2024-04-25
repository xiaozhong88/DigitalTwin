<template>
  <div id="mBar" class="p-6">
    <div class="text-light-900 text-center">
      鱼料投喂总量：
      <span ref="totalAmountsTargrt" class="text-gradient font-[Electronic] text-7xl ml-2 mr-2 font-bold">
        {{ totalAmounts }}
      </span>
      克
    </div>
    <div class="mt-3 flex flex-wrap">
      <div v-for="(amount, index) in feedingAmounts" :key="index" class="w-1/3 text-center text-light-900 text-sm">
        {{ areaName[index] + '：' }}
        <span ref="cityRefs" class="text-[#5DC5EF] text-3xl font-[Electronic] mr-2">
          {{ amount }}
        </span>
        克
      </div>
      <!-- <div class="w-1/3 text-center text-light-900 text-sm">
        鱼池一：
        <span ref="city1" class="text-[#5DC5EF] text-3xl font-[Electronic] mr-2">
          8,778,988
        </span>
        克
      </div> -->
    </div>
    <div class="flex grid grid-cols-4 place-items-center mt-1">
      <div class="text-light-900 text-center col-span-2">
        鱼均重量：
        <span ref="fishWAvgTargrt" class="text-gradient font-[Electronic] text-4xl ml-2 mr-2 font-bold">
          {{ fishWAvg }}
        </span>
        克
      </div>
      <!-- <button id="btn" class="w-20 h-20 bg-green-500 mt-4" onclick="(e)=>{
            // e.stopPropagation();
                console.log('按钮点击了')
            }"></button> -->
      <div class="text-light-900 text-center col-span-2 mt-1">
        鱼总量：
        <span ref="fishWTotalTargrt" class="text-gradient font-[Electronic] text-4xl ml-2 mr-2 font-bold">
          {{ fishWTotal }}
        </span>
        亩
      </div>
    </div>
    <div class="flex place-items-center justify-center grid grid-cols-5">
      <!-- <input class="col-span-2" type="file" @change="runModel"> -->
      <el-button class="col-span-2"
        style="background-color: transparent; height: 48px; border-radius: 40px; font-size: 16px; color: white; font-weight: bold;"
        :loading="isLoading" @click="runMul" size='small' round>预测</el-button>
      <div class="col-span-3">
        <div>
          定时投喂：
          <el-switch v-model="value" size="large" active-text="开启" inactive-text="关闭" />
        </div>
        <el-radio-group v-model="radio" @change="timeRunMul">
          <el-radio v-for="(item, index) in options" :key="index" :value="item" :label="item" :disabled="!value"
            style="font-size: 20px;" />
        </el-radio-group>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, watchEffect } from 'vue';
import { CountUp } from 'countup.js';
import { runModel } from "../../utils/modelGen";
import { loadModelFromRemote } from '../../utils/modelGen';
import { setPredict } from '../../three/scene/FishPond';

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const totalAmountsTargrt = ref(null);
const fishWAvgTargrt = ref(null);
const fishWTotalTargrt = ref(null);
const cityRefs = ref([]);
const cityCountUps = [];

const options = ref(['4小时', '6小时', '12小时', '24小时']);
const areaName = ['鱼池一', '鱼池二', '鱼池三', '鱼池四', '鱼池五', '鱼池六'];
const selectedOption = ref(options.value[0]);
const time = [4, 6, 12, 24];

const value = ref(false)
const radio = ref(4)

const feedingAmounts = ref([1759.001, 1759.001, 1759.001, 1759.001, 1759.001, 1759.001]);
const totalAmounts = ref(1759.001 * 6);
const fishWAvg = ref(75.01);
const fishWTotal = ref(460);
const isLoading = ref(false);
const runMul = () => {
  let sum = 0;
  isLoading.value = !isLoading.value;
  setTimeout(() => {
    isLoading.value = !isLoading.value;
    feedingAmounts.value = feedingAmounts.value.map(() => {
      const temp = (1759 + Math.random() * 100 - 50 + Math.random());
      sum += temp;
      return temp.toFixed(3);
    });
    totalAmounts.value = sum.toFixed(3);
    const temp = 75.01 + Math.random() * 2;
    fishWAvg.value = temp.toFixed(2);
    fishWTotal.value = Math.floor(temp * 6);

    cityCountUps[0].update(totalAmounts.value);
    cityCountUps[1].update(fishWAvg.value);
    cityCountUps[2].update(fishWTotal.value);
    for (let i = 0; i < 6; i++) {
      cityCountUps[i + 3].update(feedingAmounts.value[i]);
    }

    setPredict(true);
    // const model = loadModelFromRemote();
    // model.predict();
  }, 500);
}

const timeRunMul = (e) => {
  var t = 0;
  for (let i = 0; i < 4; i++) {
    if (options.value[i] === e) {
      t = time[i];
    }
  }
  // setInterval(() => {
  // const model = loadModelFromRemote();
  // model.predict();
  // },t*60*60*1000);
}

onMounted(() => {
  cityCountUps.push(new CountUp(totalAmountsTargrt.value, totalAmounts.value));
  cityCountUps.push(new CountUp(fishWAvgTargrt.value, fishWAvg.value));
  cityCountUps.push(new CountUp(fishWTotalTargrt.value, fishWTotal.value));

  for (let i = 0; i < 6; i++) {
    cityCountUps.push(new CountUp(cityRefs.value[i], feedingAmounts.value[i]));
  }

  for (let i = 0; i < cityCountUps.length; i++) {
    cityCountUps[i].start();
  }

  // new CountUp(city6.value, props.data.xb).start()

  // document.getElementById('app').querySelector('#pred').addEventListener("pointerdown", (e) => {
  //   console.log('按钮点击了')
  // });
})

// watchEffect(() => {
//   console.log('更新后的鱼总量:', feedingAmount1.value);
// })

</script>

<style scoped>
#mBar {
  height: 98% !important;
  align-items: center;
  overflow-y: scroll;
  scrollbar-width: none;
  /* firefox */
  -ms-overflow-style: none;
  /* IE 10+ */
}

#mBar::-webkit-scrollbar {
  display: none;
}

.el-button {
  width: 45%;
  overflow: hidden;
  box-shadow: inset 0 0 6px 2px #888;
}

.el-button .custom-loading .circular {
  margin-right: 6px;
  width: 18px;
  height: 18px;
  animation: loading-rotate 2s linear infinite;
}

.el-button .custom-loading .circular .path {
  animation: loading-dash 1.5s ease-in-out infinite;
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  stroke-width: 2;
  stroke: var(--el-button-text-color);
  stroke-linecap: round;
}

.el-switch__label.is-active {
  color: white !important;
}

.el-radio__label {
  font-size: 16px !important;
  color: white;
}

#butt {
  display: flex;
  align-items: center;
  width: 150px;
  height: 50px;
  border: 1px solid transparent;
  overflow: hidden;
  box-sizing: content-box;
  /* cursor: pointer; */
  box-shadow: inset 0 0 6px 2px #888;

  /* #butt div {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 144px;
    height: 44px;
    color: #000;
    border-radius: 23px;
    background-color: #fff;
  } */

  /* #butt::before {
    position: absolute;
    content: "";
    top: 50%;
    left: 50%;
    width: 30px;
    height: 150px;
    animation: anim 6s linear infinite;
    transform-origin: center;
    transform: translate(-50%, -50%);
    background-image: linear-gradient(to left, #e71919, #d849b1, #f7f31d);
  } */
}

@keyframes anim {
  100% {
    transform: translate(-50%, -50%) rotate(720deg);
  }
}
</style>