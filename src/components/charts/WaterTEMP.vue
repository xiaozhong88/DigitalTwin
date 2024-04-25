<template>
  <div class="w-full h-full">
    <!-- <div class="text-center">大区信息数据</div> -->
    <!-- <div id="horizontalBar" ref="target" class="w-full h-full"></div> -->
    <el-carousel :interval="4000" :motion-blur="true">
      <el-carousel-item v-for="index in 6" :key="index">
        <div ref="tempRefs" class="w-full h-full" style="object-fit: scale-down;"></div>
      </el-carousel-item>
    </el-carousel>
    <!-- <div ref="target" class="w-full h-full"></div> -->
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { WaterTEMPEchart as eecharts } from '../../utils/allEchart';
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})
// console.log(props.data)
const highlight = '#03b7c9';
let temp = [25.0, 24.5, 25.7, 23.9, 24.6, 25.9];
const tempConf = {
  name: '温度',
  unit: '℃',
  pos: ['50%', '50%'],
  range: [0, 50],
  YS: [
    [0.3, '#119eff'],
    [0.5, '#30da74'],
    [1, '#f3390d']
  ]
};

// 1. 初始化 echarts 实例
// const mChart = ref(null);
const target = ref(null);
// const fish1 = ref(null);
// const fish2 = ref(null);
// const fish3 = ref(null);
// const fish4 = ref(null);
// const fish5 = ref(null);
// const fish6 = ref(null);
// const fishs = [fish1, fish2, fish3, fish4, fish5, fish6];
const areaName = ['鱼池一', '鱼池二', '鱼池三', '鱼池四', '鱼池五', '鱼池六'];
const tempRefs = ref([]);

onMounted(() => {

  setTimeout(() => {
    tempRefs.value.forEach((fish, index) => {
      eecharts.value[index] = echarts.init(fish);
      // 2. 构建 option 配置对象
      const options = {
        title: {
          text: areaName[index],
          textStyle: {
            color: 'rgba(248, 249, 250, 1)'
          }
        },
        series: [{ // 外围刻度
          type: 'gauge',
          center: tempConf.pos,
          radius: '60%', // 1行2个
          splitNumber: tempConf.splitNum || 10,
          min: tempConf.range[0],
          max: tempConf.range[1],
          startAngle: 225,
          endAngle: -45,
          axisLine: {
            show: true,
            lineStyle: {
              width: 2,
              shadowBlur: 0,
              color: [
                [1, highlight]
              ]
            }
          },
          axisTick: {
            show: true,
            lineStyle: {
              color: highlight,
              width: 1
            },
            length: -5,
            splitNumber: 10
          },
          splitLine: {
            show: true,
            length: -10,
            lineStyle: {
              color: highlight,
            }
          },
          axisLabel: {
            distance: -18,
            color: 'rgb(191, 201, 202)',
            fontSize: '12'
          },
          pointer: {
            show: false
          },
          detail: {
            show: false
          }
        }, { // 内侧指针、数值显示
          name: '速度',
          type: 'gauge',
          center: tempConf.pos,
          splitNumber: tempConf.splitNum || 10,
          min: tempConf.range[0],
          max: tempConf.range[1],
          radius: '55%',
          axisLine: { // 坐标轴线
            show: false,
            lineStyle: { // 属性lineStyle控制线条样式
              color: tempConf.YS,
              shadowColor: "#ccc",
              shadowBlur: 25,
              width: 0
            }
          },
          axisLabel: {
            show: false
          },
          axisTick: { // 坐标轴小标记
            // show: false,
            length: 20, // 属性length控制线长
            lineStyle: { // 属性lineStyle控制线条样式
              color: 'auto',
              width: 2
            }
          },
          splitLine: { // 分隔线
            show: false,
            length: 20, // 属性length控制线长
            lineStyle: { // 属性lineStyle（详见lineStyle）控制线条样式
              color: 'auto'
            }
          },
          title: { // 其余属性默认使用全局文本样式，详见TEXTSTYLE
            fontWeight: 'bolder',
            fontSize: 20,
            fontStyle: 'italic'
          },
          detail: {
            show: true,
            offsetCenter: [0, '100%'],
            color: 'inherit',
            fontSize: 25,
            formatter: function (value) {
              return value.toFixed(1) + ' ' + (tempConf.unit || '');
            },
            rich: {
              name: {
                fontSize: 16,
                lineHeight: 30,
                color: '#4be4de'
              }
            }
          },
          data: [{
            value: temp[index]
          }],
          pointer: {
            width: 5
          },
          itemStyle: { //表盘指针的颜色
            borderColor: '#ff9900',
            borderWidth: 1,
            color: '#'
          },
        }, {
          name: tempConf.name,
          type: 'gauge',
          center: tempConf.pos,
          radius: '50%',
          startAngle: 225,
          endAngle: -45,
          min: tempConf.range[0],
          max: tempConf.range[1],
          axisLine: {
            show: true,
            lineStyle: {
              width: 16,
              color: [
                [1, 'rgba(75,228,255,.1)']
              ]
            }
          },
          axisTick: {
            show: 0,
          },
          splitLine: {
            show: 0,
          },
          axisLabel: {
            show: 0
          },
          detail: {
            show: false
          },
          pointer: {
            show: true,
            length: '90%',
            width: 3,
          }
        }]
      };
      // 3. 通过 实例.setOption(options)
      eecharts.value[index].setOption(options);
    });
  }, 500);
  clearTimeout();

  // renderChart()
});

const renderChart = () => {

  // console.log(props.data.regions.reduce((accumulator, item) => accumulator + Math.min(item.value, 60), 0) / 8)
  // temp = props.data.regions.reduce((accumulator, item) => accumulator + Math.min(item.value, 60), 0) / 8;
  temp = temp.map(item => item + (Math.random() * 0.4 - 0.2));

  // 4. 更新
  // mChart.value.setOption({
  //   series: [{ // 内侧指针、数值显示
  //     name: '速度',
  //     data: [{
  //       value: temp
  //     }]
  //   }]
  // });

  tempRefs.value.forEach((fish, index) => {

    eecharts.value[index].setOption({
      series: [{ // 内侧指针、数值显示
        name: '速度',
        data: [{
          value: temp[index]
        }]
      }]
    });
  })
};
// setInterval(() => {
//   renderChart();
// }, 10000);
// watch(() => props.data, () => {
//   renderChart()
// });

</script>

<style scoped>
.el-carousel {
  width: 80%;
  height: 100%;
  position: absolute;
  top: 5%;
  left: 50%;
  /* 元素左边界距离父元素左边界的距离为父元素宽度的一半 */
  transform: translateX(-50%) !important;
}

:deep().el-carousel__container {
  height: 100%;
}

:deep().el-carousel__item--card {
  width: 100% !important;
  height: 100% !important;
  /* background: #fff; */
}

:deep().el-carousel__item {
  width: 100% !important;
  height: 100% !important;
  /* background-color: #d3dce6; */
}

:deep().el-carousel__item--card.is-active {
  /* z-index: 2; */
  /* position: absolute; */
  left: 50%;
  transform: translate(-50%, 0px) !important;
}

:deep().el-carousel__indicators--horizontal {
  position: absolute;
  bottom: 5%;
  text-align: center;
}

:deep().el-carousel__indicators--horizontal button {
  width: 6px;
  height: 6px;
  background: #ffffff;
  border-radius: 50%;
  opacity: 0.5;
}

:deep().el-carousel__indicator--horizontal.is-active button {
  width: 14px;
  height: 6px;
  background: #ffffff;
  opacity: 1;
  border-radius: 10px;
}
</style>