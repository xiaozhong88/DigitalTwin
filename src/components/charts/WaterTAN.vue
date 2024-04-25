<template>
  <div class="w-full h-full">
    <!-- <div class="text-center">大区异常处理</div> -->
    <div ref="target" class="w-full h-full"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
import { WaterTANEchart as mChart } from '../../utils/allEchart';
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})
const areaName = ['鱼池一', '鱼池二', '鱼池三', '鱼池四', '鱼池五'];
let tempData = [0.16, 0.12, 0.08, 0.07, 0.14];

const target = ref(null)

onMounted(() => {
  mChart.value = echarts.init(target.value);
  const options = {
    // 图例配置
    legend: {
      show: true,
      icon: 'circle',
      top: '12%',
      left: '55%',
      // data: props.data.abnormals.map((item) => item.name),
      data: areaName,
      width: -5,
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 6,
      textStyle: {
        fontSize: 12,
        lineHeight: 5,
        color: 'rgba(255, 255, 255, 0.8)'
      }
    },
    // 提示层
    tooltip: {
      show: true,
      trigger: 'item',
      // formatter: '区域<br>{b}:{c}({d}%)',
      formatter: (params) => {
        return '区域<br>' + params.name + "：" + params.value.toFixed(2) + '(' + params.percent + ')';
      }
      // valueFormatter: (value) => value.toFixed(2)
    },
    // Y 轴
    yAxis: [
      {
        type: 'category',
        inverse: true,
        axisLine: {
          show: false
        }
      }
    ],
    // X 轴
    xAxis: [
      {
        show: false
      }
    ],
    // 核心配置
    series: getSeriesData()
  };
  mChart.value.setOption(options);

  // renderChart()
})

const getSeriesData = () => {
  const series = [];

  // props.data.abnormals.forEach((item, index) => {
  tempData.forEach((item, index) => {
    // 上层
    series.push({
      // name: item.name,
      name: areaName[index],
      type: 'pie',
      clockwise: false,
      emphasis: {
        scale: false
      },
      radius: [73 - index * 15 + '%', 68 - index * 15 + "%"],
      center: ['50%', '50%'],
      label: {
        show: false
      },
      data: [
        {
          // value: item.value,
          value: item,
          // name: item.name
          name: areaName[index]
        },
        {
          value: 0.4,
          itemStyle: {
            color: 'rgba(0, 0, 0, 0)',
            borderWidth: 0
          },
          tooltip: {
            show: false
          },
          // hoverAnimation: false
        }
      ]
    })
    // 下层
    series.push({
      // name: item.name,
      name: areaName[index],
      type: 'pie',
      silent: true,
      z: 1,
      clockwise: false,
      emphasis: {
        scale: false
      },
      radius: [73 - index * 15 + '%', 68 - index * 15 + "%"],
      center: ['50%', '50%'],
      label: {
        show: false
      },
      data: [
        {
          value: 7.5,
          itemStyle: {
            color: 'rgb(3, 31, 62)',
            borderWidth: 0
          },
          tooltip: {
            show: false
          },
        },
        {
          value: 2.5,
          itemStyle: {
            color: 'rgba(0, 0, 0, 0)',
            borderWidth: 0
          },
          tooltip: {
            show: false
          },
        }
      ]
    })
  });

  return series
}

const renderChart = () => {
  const series = [];
  // props.data.abnormals.forEach((item, index) => {
  tempData.forEach((item, index) => {
    // 上层
    series.push({
      // name: item.name,
      name: areaName[index],
      data: [
        {
          value: item,
          name: areaName[index]
        },
        {
          value: 0.4,
          itemStyle: {
            color: 'rgba(0, 0, 0, 0)',
            borderWidth: 0
          },
          tooltip: {
            show: false
          }
        }
      ]
    });
    // 下层
    series.push({
      // name: item.name,
      name: areaName[index],
      data: [
        {
          value: 7.5,
          itemStyle: {
            color: 'rgb(3, 31, 62)',
            borderWidth: 0
          }
        },
        {
          value: 2.5,
          itemStyle: {
            color: 'rgba(0, 0, 0, 0)',
            borderWidth: 0
          }
        }
      ]
    })
  });
  mChart.value.setOption({
    series: series
  });
};

// setInterval(() => {
//   tempData = tempData.map(item => item + (Math.random() * 0.02 - 0.01));
//   // console.log(tempData);
//   renderChart();
// }, 8000);
// watch(() => props.data, renderChart);
</script>

<style lang="scss" scoped></style>