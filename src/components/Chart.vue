<template>
  <div>
    <h2>LabVIEW 实时数据图表</h2>
    <div ref="chart" style="width: 800px; height: 400px; margin-top: 20px;"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const chart = ref(null)
let myChart

const times = []      // 时间戳（x轴）
const temps = []      // input_temperature（y轴）
const MAX_POINTS = 50 // 最多展示的数据点数

onMounted(() => {
  myChart = echarts.init(chart.value)
  myChart.setOption({
    title: { text: 'Input Temperature 曲线图' },
    xAxis: { type: 'category', data: times },
    yAxis: { type: 'value' },
    series: [{
      name: 'Input Temp',
      type: 'line',
      data: temps,
      smooth: true
    }]
  })

  // 监听 LabVIEW 推送的数据
  window.labAPI?.onData((data) => {
    const temp = data.input_temperature
    const label = new Date().toLocaleTimeString()

    if (typeof temp === 'number') {
      times.push(label)
      temps.push(temp)

      if (times.length > MAX_POINTS) {
        times.shift()
        temps.shift()
      }

      myChart.setOption({
        xAxis: { data: times },
        series: [{ data: temps }]
      })
    }
  })
})
</script>
