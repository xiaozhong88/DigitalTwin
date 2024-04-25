<template>
  <div class="w-full h-full">
    <!-- <div class="text-center">数据传递信息</div> -->
    <div ref="target" class="w-full h-full"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
import { WaterNITEchart as mChart } from '../../utils/allEchart';
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})
const areaName = ['鱼池一', '鱼池二', '鱼池三', '鱼池四', '鱼池五'];
const areaColor = ['#0092f6', '#00d4c7', '#aecb56', '#7D3C98', '#D35400']
let ddata = [[0.15, 0.12, 0.13, 0.15, 0.19, 0.14],
[0.22, 0.18, 0.19, 0.23, 0.21, 0.13],
[0.12, 0.13, 0.1, 0.03, 0.09, 0.02],
[0.15, 0.12, 0.1, 0.03, 0.09, 0.07],
[0.05, 0.22, 0.08, 0.04, 0.22, 0.06]];
const categories = (function () {
  let now = new Date();
  let res = [];
  let len = 5;
  while (len--) {
    res.unshift(now.toLocaleTimeString().replace(/^\D*/, ''));
    now = new Date(+now - 2000);
  }
  return res;
})();

const target = ref(null)
// let mChart = null

const getSeriesData = () => {
  const series = []

  // props.data.relations.forEach((item, index) => {}
  areaName.forEach((item, index) => {
    series.push({
      name: item,
      type: 'line',
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: {
        color: areaColor[index]
      },
      lineStyle: {
        color: areaColor[index],
        width: 1
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [{
          offset: 0,
          color: 'rgba(7,44,90,0.3)'
        }, {
          offset: 1,
          color: 'rgba(0,146,246,0.9)'
        }]),
      },
      markPoint: {
        itemStyle: {
          color: 'red'
        }
      },
      data: ddata[index]
    })
  });

  return series
}

onMounted(() => {
  mChart.value = echarts.init(target.value);
  const options = {
    grid: {
      left: '5%',
      // right: '10%',
      top: '20%',
      bottom: '15%',
      containLabel: true
    },
    tooltip: {
      show: true,
      trigger: 'item',
      valueFormatter: (value) => value.toFixed(2) + ' mg/L'
    },
    legend: {
      show: true,
      x: 'center',
      icon: 'stack',
      itemWidth: 5,
      itemHeight: 5,
      textStyle: {
        color: '#1bb4f6'
      },
      data: areaName
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        axisLabel: {
          color: '#30eee9'
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#397cbc'
          }
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false
        },
        data: categories
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: 'NO2- mg/L',
        min: 0,
        max: 0.25,
        axisLabel: {
          formatter: function (value) {
            return value.toFixed(2);
          },
          color: '#2ad1d2'
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#27b4c2'
          }
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false
        },
      }
    ],
    series: getSeriesData()
  };
  mChart.value.setOption(options);

  // renderChart();
})

const renderChart = () => {
  // const options = {
  //   xAxis: {
  //     show: false,
  //     type: 'value'
  //   },
  //   yAxis: {
  //     show: false,
  //     type: 'value'
  //   },
  //   series: [
  //     {
  //       type: 'graph',
  //       layout: 'none',
  //       coordinateSystem: 'cartesian2d',
  //       symbolSize: 26,
  //       z: 3,
  //       edgeLabel: {
  //         show: true,
  //         color: '#fff',
  //         fontSize: 14,
  //         formatter: function (params) {
  //           return params.data.speed
  //         }
  //       },
  //       label: {
  //         show: true,
  //         position: 'bottom',
  //         color: '#5E5E5E'
  //       },
  //       edgeSymbol: ['none', 'arrow'],
  //       edgeSymbolSize: 8,
  //       data: props.data.relations.map((item) => {
  //         if (item.id !== 0) {
  //           return {
  //             name: item.name,
  //             category: 0,
  //             active: true,
  //             speed: `${item.speed}kb/s`,
  //             value: item.value
  //           }
  //         } else {
  //           return {
  //             name: item.name,
  //             value: item.value,
  //             symbolSize: 100,
  //             itemStyle: {
  //               color: {
  //                 colorStops: [
  //                   {
  //                     offset: 0, color: '#157eff'
  //                   },
  //                   {
  //                     offset: 1, color: '#35c2ff'
  //                   }
  //                 ]
  //               }
  //             },
  //             label: {
  //               fontSize: '14'
  //             }
  //           }
  //         }
  //       }),
  //       links: props.data.relations.map((item, index) => ({
  //         source: item.source,
  //         target: item.target,
  //         speed: `${item.speed}kb/s`,
  //         lineStyle: {
  //           color: '#12b5d0',
  //           curveness: 0.2
  //         },
  //         label: {
  //           show: true,
  //           position: 'middle',
  //           offset: [10, 0]
  //         }
  //       }))
  //     },
  //     {
  //       type: 'lines',
  //       coordinateSystem: 'cartesian2d',
  //       z: 1,
  //       effect: {
  //         show: true,
  //         smooth: false,
  //         trailLength: 0,
  //         symbol: 'arrow',
  //         color: 'rgba(55, 155, 255, 0.6)',
  //         symbolSize: 12
  //       },
  //       lineStyle: {
  //         curveness: 0.2
  //       },
  //       coords: [
  //         [0, 300], [50, 200],
  //         [0, 100], [50, 200],
  //         [50, 200], [100, 100],
  //         [50, 200], [100, 300]
  //       ]
  //     }
  //   ]
  // }

  mChart.value.setOption({
    xAxis: [{
      data: categories
    }],
    series: getSeriesData()
  });

  ddata = ddata.map(innerArray => {
    let oldData = innerArray.shift();
    innerArray.push(Math.max(Math.min(oldData + (Math.random() * (0.04) - 0.02), 0.2), 0.01));
    return innerArray;
  });
  let axisData = new Date().toLocaleTimeString().replace(/^\D*/, '');
  categories.shift();
  categories.push(axisData);
};

// setInterval(() => {
//   renderChart();
// }, 6000);
// watch(() => props.data, renderChart);
</script>

<style lang="scss" scoped></style>