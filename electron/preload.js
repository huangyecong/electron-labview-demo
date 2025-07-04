// 前端和主进程通信桥梁（使用 Electron 的 contextBridge）
// 暴露给前端使用的安全 API，用于发送和接收数据
const { contextBridge, ipcRenderer } = require('electron');
// const { send } = require('vite');

contextBridge.exposeInMainWorld('labAPI', {
  // 安全暴露方法，这些方法被前端 Vue 页面使用，实现前后通信
  send: (msg) => ipcRenderer.send('labview-send', msg),//发送数据给服务端:直接发命令（灵活）
  sendCommand:(field,value) => {
    ipcRenderer.send('labview-command', {field,value})
  },// 发送命令:主进程拼接字符串（更统一）
  onData: (cb) => ipcRenderer.on('labview-data', (_, data) => cb(data))
});
console.log('[preload] window.labAPI injected')
