<template>
  <div class="w-full h-full">
    <!-- <div class="text-center">服务资源占用比</div> -->
    <div ref="target" class="w-full h-full pr-1 pl-1"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
import { PhValueEchart as mChart } from '../../utils/allEchart';
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})
const areaName = ['鱼池一', '鱼池二', '鱼池三', '鱼池四', '鱼池五', '鱼池六'];
let tempData = [6.6, 6.8, 7.2, 7.9, 8.1, 7.5];
const changeData = (value) => {
  // console.log('-----', value)
  // let newData = []
  // for (let i = 0; i < value.length; i++) {
  //   newData[i] = value[i] - 7
  // }
  return value - 7;
}

const target = ref(null)
// let mChart = null

onMounted(() => {
  mChart.value = echarts.init(target.value);
  const options = {
    xAxis: {
      type: 'category',
      // data: props.data.servers.map(item => item.name),
      data: areaName,
      axisLabel: {
        color: '#ebf8ac',
        fontSize: 12
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      // // max: function (value) {
      // //   return parseInt(value.max * 1.2)
      // // }

      splitNumber: 14,
      min: -7,
      max: 7,
      axisLabel: {
        show: true,
        // formatter: function (value) {
        //   return value + 7;
        // },
        formatter: function (value) {
          value = value + 7;
          if (value === 7) {
            return '中性';
          } else if (value === 12) {
            return '强碱性';
          } else if (value === 9) {
            return '弱碱性';
          } else if (value === 5) {
            return '弱酸性';
          } else if (value === 2) {
            return '强酸性';
          }
        },
        color: '#ebf8ac',
        width: 40,
        overflow: "truncate"
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#ebf8ac'
        }
      },
      splitLine: {
        show: false
      },
      scale: true,
      // data: ['强酸', '弱酸', '中性', '弱碱', '强碱']
    },
    grid: {
      top: 10,
      right: 10,
      bottom: 40,
      left: '2%',
      containLabel: true
    },
    tooltip: {
      show: true,
      // trigger: "axis",
      axisPointer: {
        type: "shadow"
      },
      formatter: function (param) {
        // console.log(param)
        return '时间<br/>' + param.marker + param.name + ': ' + (param.value + 7).toFixed(1);
      }
    },
    series: [
      {
        type: 'bar',
        // data: props.data.servers.map((item, index) => ({
        //   // name: item.name,
        //   name: areaName[index],
        //   value: changeData(item.value / 10)
        // })),
        data: tempData.map((item, index) => ({
          name: areaName[index],
          value: changeData(item)
        })),
        itemStyle: {
          // color: '#479AD3',
          color: (params) => {
            // console.log(params)
            if (params.value < 0) {
              if (params.value < -4) { // ph < 3
                return new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 1,
                  color: "rgba(255, 0, 0, 1)" // 红
                }, {
                  offset: 0.6,
                  color: "rgba(255, 255, 0, 1)" // 黄
                }]);
              } else {
                return new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 1,
                  color: "rgba(255, 255, 0, 1)"
                }]);
              }
            } else if (params.value > 0) {
              if (params.value < 4) { // ph < 11
                return new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 1,
                  color: "rgba(0, 191, 255, 1)"
                }]);
              } else {
                return new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 1,
                  color: "rgba(0, 191, 255, 1)" // 蓝
                }, {
                  offset: 0.6,
                  color: "rgba(128, 0, 128, 1)" // 紫
                }]);
              }
            } else {
              return 'rgba(0, 128, 0, 1)';
            }
            // if (params.value < -4) { // 红
            //   return 'rgba(255, 0, 0, 1)';
            // } else if (params.value > -4 && params.value < 0) { // 黄
            //   return 'rgba(255, 255, 0, 1)';
            // } else if (params.value == 0) { // 绿
            //   return 'rgba(0, 128, 0, 1)';
            // } else if (params.value > 0 && params.value < 4) { // 蓝
            //   return 'rgba(0, 191, 255, 1)'
            // } else { // 紫
            //   return 'rgba(128, 0, 128, 1)'
            // }
          },
          borderRadius: [5, 5, 5, 5],
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowBlur: 5
        },
        barWidth: 30,

        // label: {
        //   show: true,
        //   position: 'top',
        //   color: '#fff',
        //   formatter: '{c}%'
        // }
      }
    ]
  };
  mChart.value.setOption(options);
  // renderChart();
})

const renderChart = () => {
  mChart.value.setOption({
    series: {
      // data: props.data.servers.map((item, index) => ({
      //   // name: item.name,
      //   name: areaName[index],
      //   value: changeData(item.value / 10)
      // }))
      data: tempData.map((item, index) => ({
        name: areaName[index],
        value: changeData(item)
      }))
    }
  });
}
// setInterval(() => {
//   tempData = tempData.map((item) => {
//     return item + Math.random() * 0.6 - 0.3;
//   });
//   renderChart();
//   // console.log(tempData);
// }, 4000);

// watch(() => props.data, renderChart);
</script>

<style lang="scss" scoped></style>