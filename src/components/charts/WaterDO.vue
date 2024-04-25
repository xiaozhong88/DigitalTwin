<template>
  <div class="w-full h-full">
    <!-- <div class="text-center">云端报警风险</div> -->
    <div ref="target" class="w-full h-full"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
import { WaterDOEchart as mChart } from '../../utils/allEchart';
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})
const areaName = ['鱼池一', '鱼池二', '鱼池三', '鱼池四', '鱼池五', '鱼池六'];
const ddata = ref([4.5, 5.1, 5.2, 5.6, 5.5, 6.5]);
// let ddata = props.data.risks.map((item) => item.value / 6);
// console.log(props.data.risks.map((item) => item.value / 6))
let doData = { name: '区域', value: ddata.value };

const target = ref(null);
// let mChart = null

onMounted(() => {
  mChart.value = echarts.init(target.value);
  const options = {
    // 雷达图坐标系
    radar: {
      axisName: {
        color: '#05D5FF',
        fontSize: 14,
        formatter: '【{value}】'
      },
      shape: 'polygon',
      center: ['50%', '50%'],
      radius: '80%',
      startAngle: 120,
      axisLine: {
        lineStyle: {
          color: 'rgba(5, 213, 255, .8)'
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          width: 1,
          color: 'rgba(5, 213, 255, .8)'
        }
      },
      indicator: props.data.risks.map((item, index) => ({
        // name: item.name,
        name: areaName[index],
        max: 10
      })),
      splitArea: {
        show: false
      },
      axisNameGap: 8
    },
    // 坐标极点
    polar: {
      center: ['50%', '50%'],
      radius: '0%'
    },
    // 坐标角度
    angleAxis: {
      min: 0,
      interval: 5,
      clockWise: false
    },
    // 径向轴
    radiusAxis: {
      min: 0,
      interval: 20,
      splitLine: {
        show: true
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(211,211,211,0.8)',
      valueFormatter: (value) => {
        return value.toFixed(1) + ' mg/L';
      },
      axisPointer: {
        laber: {
          color: '#fff'
        }
      }
    },
    // 图标核心配置
    series: {
      type: 'radar',
      symbol: 'circle',
      symbolSize: 10,
      itemStyle: {
        color: '#05D5FF'
      },
      areaStyle: {
        color: '#05D5FF',
        opacity: 0.5
      },
      lineStyle: {
        width: 2,
        color: '#05D5FF'
      },
      label: {
        show: true,
        color: '#fff',
        formatter: function (params) {
          return params.value.toFixed(1);
        }
      },
      data: [
        doData
      ]
    }
  };

  mChart.value.setOption(options);
  // renderChart()
})

// setInterval(() => {
//   renderChart();
// }, 5000);
const renderChart = () => {
  // doData.value = props.data.risks.map((item) => item.value / 6);
  doData.value = ddata.value.map(item => item + Math.random() * 0.4 - 0.2);

  mChart.value.setOption({
    radiusAxis: {
      min: 0,
      interval: 20,
      splitLine: {
        show: true
      }
    },
    series: {
      data: [
        doData
      ]
    }
  });
};

// watch(() => props.data, renderChart);
</script>

<style lang="scss" scoped></style>