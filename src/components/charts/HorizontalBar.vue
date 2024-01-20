<template>
  <div class="w-full h-full">
    <div class="text-center">大区信息数据</div>
    <div id="horizontalBar" ref="target" class="w-full h-full"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})
// console.log(props.data)

// 1. 初始化 echarts 实例
let mChart = null;
const target = ref(null)
onMounted(() => {
  mChart = echarts.init(target.value)
  renderChart()
})
// 2. 构建 option 配置对象
const renderChart = () => {
  const options = {
    // x 轴展示数据
    xAxis: {
      show: false,
      type: 'value',
      max: function (value) {
        return parseInt(value.max * 1.2)
      }
    },
    // y 轴展示数据
    yAxis: {
      type: 'category',
      data: props.data.regions.map((item) => item.name),
      inverse: true,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#9eb1c8'
      }
    },
    // 图标绘制的位置，上下左右
    grid: {
      top: 0,
      right: 15,
      bottom: 0,
      left: 20,
      containLabel: true
    },
    // 核心配置
    series: [
      {
        type: 'bar',
        data: props.data.regions.map((item) => ({
          name: item.name,
          value: item.value
        })),
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.2)'
        },
        itemStyle: {
          color: '#479AD3',
          borderRadius: 5,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowBlur: 5
        },
        barWidth: 12,
        label: {
          show: true,
          position: 'right',
          color: '#fff'
        }
      }
    ]
  }

  // 3. 通过 实例.setOption(options)
  mChart.setOption(options)
}

watch(() => props.data, () => {
  renderChart()
})
</script>

<style lang="scss" scoped></style>