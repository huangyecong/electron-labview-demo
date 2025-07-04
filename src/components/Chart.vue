<template>
  <div>
    <h2>LabVIEW 实时多参数图表</h2>
    <div ref="chart" style="width: 100%; height: 500px; margin-top: 20px;"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const chart = ref(null)
let myChart
const MAX_POINTS = 50

// x轴时间数组
const timeLabels = []

// 每条曲线的历史数据
const dataSeries = {
  input_temperature: [],
  output_temperature: [],
  ph: [],
  pressure: [],
  reactor_temperature: [],
  room_temperature: [],
  weight: []
}

// 初始化图表
onMounted(() => {
  myChart = echarts.init(chart.value)

  const series = Object.keys(dataSeries).map((key) => ({
    name: key.replace(/_/g, ' '),
    type: 'line',
    data: dataSeries[key],
    smooth: true
  }))

  myChart.setOption({
    // title: { text: 'LabVIEW 实时数据曲线图' },
    tooltip: { trigger: 'axis' },
    legend: { data: series.map(s => s.name) },
    xAxis: { type: 'category', data: timeLabels },
    yAxis: { type: 'value' },
    series
  })

  // 接收数据事件
  window.labAPI?.onData((data) => {
    const time = new Date().toLocaleTimeString()
    timeLabels.push(time)
    if (timeLabels.length > MAX_POINTS) timeLabels.shift()

    Object.keys(dataSeries).forEach((key) => {
      const val = parseFloat(data[key])
      if (!isNaN(val)) {
        dataSeries[key].push(val)
        if (dataSeries[key].length > MAX_POINTS) dataSeries[key].shift()
      }
    })

    myChart.setOption({
      xAxis: { data: timeLabels },
      series: Object.keys(dataSeries).map((key) => ({
        name: key.replace(/_/g, ' '),
        data: dataSeries[key]
      }))
    })
  })
})
</script>
