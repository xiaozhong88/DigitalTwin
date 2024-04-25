<template>
  <div class="w-full h-full">
    <!-- <div class="text-center">关键词条</div> -->
    <div ref="target" class="w-full h-full"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
import 'echarts-wordcloud';
import { WaterH2SEchart as mChart } from '../../utils/allEchart';
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})
const areaName = ['鱼池一', '鱼池二', '鱼池三', '鱼池四', '鱼池五', '鱼池六'];
let newData = [0.04, 0.06, 0.02, 0.1, 0.09, 0.15];
let QoQData = [2, 1, -1, 3, 0, 1];
const getData = () => {
  let propData = []

  for (let i = 0; i < 6; i++) {
    propData[i] = newData[i];
    newData[i] = Math.max(Math.min(propData[i] + (Math.random() * (0.04) - 0.02), 0.22), 0.01);
    QoQData[i] = (newData[i] - propData[i]) / propData[i];
  };
};

const target = ref(null)
// let mChart = null

onMounted(() => {
  mChart.value = echarts.init(target.value)
  const options = {
    grid: {
      top: "10%",
      bottom: "20%"//也可设置left和right设置距离来控制图表的大小
    },
    tooltip: {
      show: true
      // trigger: "axis",
      // axisPointer: {
      //   type: "shadow",
      //   label: {
      //     show: true
      //   }
      // }
      // formatter: function (param) {
      //   console.log(param)
      //   return param.marker + param.name + ': ' + (param.value + 7);
      // }
    },
    legend: {
      data: ["环比变化率", "硫化氢含量"],
      top: "0%",
      right: "20%",
      textStyle: {
        color: "#ffffff",
        fontSize: 12
      }
    },
    xAxis: {
      data: areaName,
      axisLine: {
        show: true, //隐藏X轴轴线
        lineStyle: {
          color: '#01FCE3'
        }
      },
      axisTick: {
        show: true //隐藏X轴刻度
      },
      axisLabel: {
        show: true,
        color: "#ebf8ac" //X轴文字颜色
      },
      slitLine: {
        show: false
      }
    },
    yAxis: [{
      type: "value",
      name: "mg/L",
      min: 0,
      max: 0.25,
      nameTextStyle: {
        color: "#ebf8ac"
      },
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#FFFFFF'
        }
      },
      axisLabel: {
        show: true,
        color: "#ebf8ac"
      }
    },
    {
      type: "value",
      name: "%",
      min: -3,
      max: 3,
      nameTextStyle: {
        color: "#ebf8ac"
      },
      position: "right",
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: true
      },
      axisLabel: {
        show: true,
        formatter: "{value} %", //右侧Y轴文字显示
        color: "#ebf8ac"
      }
    }],
    series: [{
      name: "环比变化率",
      type: "line",
      yAxisIndex: 1, //使用的 y 轴的 index，在单个图表实例中存在多个 y轴的时候有用
      smooth: true, //平滑曲线显示
      showAllSymbol: true, //显示所有图形。
      symbol: "circle", //标记的图形为实心圆
      symbolSize: 10, //标记的大小
      itemStyle: {
        //折线拐点标志的样式
        color: "#058cff"
      },
      lineStyle: {
        color: "#058cff"
      },
      // areaStyle: {
      //   color: "rgba(5,140,255, 0.2)"
      // },
      tooltip: {
        valueFormatter: (value) => {
          return value.toFixed(2);
        }
      },
      data: QoQData
    },
    {
      name: "硫化氢含量",
      type: "bar",
      barWidth: 15,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          offset: 0,
          color: "#00FFE3"
        }, {
          offset: 1,
          color: "#4693EC"
        }])
      },
      label: {
        show: true,
        color: '#ffffff',
        position: 'top',
        formatter: (param) => {
          return param.value.toFixed(2);
        }
      },
      tooltip: {
        valueFormatter: (value) => {
          return value.toFixed(2);
        }
      },
      data: newData
    }]
  };
  mChart.value.setOption(options);

  // renderChart()
})

const randomRGB = () => {
  const r = Math.floor(Math.random() * 255)
  const g = Math.floor(Math.random() * 255)
  const b = Math.floor(Math.random() * 255)
  return `rgb(${r}, ${g}, ${b})`
}

const renderChart = () => {
  // console.log(props.data.datas)

  // const options = {
  //   series: [
  //     {
  //       type: 'wordCloud',
  //       sizeRange: [8, 46],
  //       rotationRange: [0, 0],
  //       gridSize: 0,
  //       layoutAnimation: true,
  //       textStyle: {
  //         color: randomRGB
  //       },
  //       emphasis: {
  //         textStyle: {
  //           fontWeight: 'bold',
  //           color: '#000'
  //         }
  //       },
  //       data: props.data.datas
  //     }
  //   ]
  // }

  getData();

  mChart.value.setOption({
    series: [{
      data: QoQData
    }, {
      data: newData
    }]
  });
};

// watch(() => props.data, renderChart);
</script>

<style lang="scss" scoped></style>