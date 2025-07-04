<template>
  <div class="labview-control">
    <h2>LabVIEW 控制面板</h2>

    <div class="command">
      <label>控制项：</label>
      <select v-model="field">
        <option value="peristaltic_pump">peristaltic_pump</option>
        <option value="weight_zero">weight_zero</option>
        <option value="stir_enable">stir_enable</option>
        <option value="cyclic_temperature">cyclic_temperature</option>
      </select>
    </div>

    <div class="command">
      <label>值：</label>
      <input v-model="inputval" placeholder="请输入数值或ON/OFF" />
    </div>

    <button @click="sendCommand">Electron 向 Labview 发送指令</button>
    <hr />

    <div class="labview-data">
      <h3>LabVIEW 返回给 Electron的实时数据</h3>
      <ul>
        <li v-for="(value, key) in labData" :key="key">
          {{ key }}: {{ value }}
        </li>
      </ul>
    </div>
    
    <hr />
    <Chart />

    <!-- <hr />
    整体流程:
    <ul>
      <div>1. Vue 页面点击按钮 → window.labview.sendCommand(...)</div>
      <div>2. preload.js 中 ipcRenderer.send('labview-command', {...})</div>
      <div>3. Electron 主进程监听 ipcMain.on('labview-command')，调用 sendLabVIEWCommand(...)</div>
      <div>4. 后端通过 TCP socket 发送指令（如 cyclic_temperature:100;）给 LabVIEW 50000 端口</div>
    </ul> -->
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import Chart from './components/Chart.vue'

const field = ref('cyclic_temperature')
const inputval = ref('')

const labData = reactive({})
const sendCommand = () => {
  if (!inputval.value) {
    alert('请输入值')
    return
  }

  // 调用 preload.js 暴露的方法
  window.labview?.sendCommand(field.value, inputval.value)
  alert(`已发送：${field.value}:${inputval.value};`)
}

onMounted(() => {
  // 监听 labview-data 事件（每次 50ms 推送一次）
  if (window.labAPI?.onData) {
    window.labAPI.onData((data) => {
      console.log('前端收到Labview数据 👉', data);
      // data 是主进程转发过来的解析结果：一个对象
      // 示例：{ pressure: '0.00', reactor_temperature: '0.00', ... }
      // Object.assign(labData, data) // 更新 labData
      labData.value = data;
    })
  } else {
    console.warn('labAPI.onData is not available')
  }
})
</script>

<style scoped>
.labview-control {
  padding: 20px;
  font-family: sans-serif;
}

.command {
  margin-bottom: 10px;
}

.labview-data {
  padding: 16px;
  font-family: monospace;
}
</style>
