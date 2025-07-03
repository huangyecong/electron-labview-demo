// 前端和主进程通信桥梁（使用 Electron 的 contextBridge）
// 暴露给前端使用的安全 API，用于发送和接收数据
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('labAPI', {
  // 安全暴露方法，这些方法被前端 Vue 页面使用，实现前后通信
  send: (msg) => ipcRenderer.send('labview-send', msg),
  onData: (cb) => ipcRenderer.on('labview-data', (_, data) => cb(data))
});
