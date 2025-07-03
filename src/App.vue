<template>
  <div>
    <h2>化学反应控制台</h2>
    <button @click="startReaction">开始反应</button>
    <button @click="queryStatus">查询设备状态</button>
    <div ref="chart" style="width:800px;height:400px;margin-top:20px;"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

const chart = ref(null);
let myChart;
const times = [], temps = [];

// “开始反应” → 向 LabVIEW 发送 start_reaction 指令
function startReaction() {
  window.labAPI.send({
    type: 'command',
    action: 'start_reaction',
    steps: [{time:0,chemical:'H2O',amount:5},{time:10,chemical:'NaCl',amount:2}]
  });
}

// “查询状态” → 发送 get_status 请求
function queryStatus() {
  window.labAPI.send({ type: 'query', action: 'get_status' });
}

onMounted(() => {
  myChart = echarts.init(chart.value);
  myChart.setOption({
    title: { text: '温度曲线' },
    xAxis: { data: times, type: 'category' },
    yAxis: { type: 'value' },
    series: [{ name: '温度', type: 'line', data: temps }]
  });

  window.labAPI.onData(data => {
    if (data.type === 'response' && data.data.temperature) {
      times.push(new Date(data.data.time).toLocaleTimeString());
      temps.push(data.data.temperature);
      myChart.setOption({ xAxis: { data: times }, series: [{ data: temps }] });
    } else {
      console.log('[收到其他数据]', data);
    }
  });
});
</script>
