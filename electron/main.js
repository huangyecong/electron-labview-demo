// Electron 主进程入口，负责创建窗口和连接 LabVIEW 模拟服务
const { app, BrowserWindow, ipcMain } = require('electron');
const { createLabVIEWClient, sendLabVIEWCommand,connectToLabVIEWDataStream } = require('./labviewClient');

const path = require('path');
const { ipcRenderer } = require('electron/renderer');

let mainWindow;
let socket;

app.whenReady().then(() => {
  // 创建窗口 (BrowserWindow)
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),//配置 preload.js 为前端和主进程的通信桥梁
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // 加载 Vite 启动的前端页面
  mainWindow.loadURL('http://localhost:5173');
  // 打卡控制台
  mainWindow.webContents.openDevTools();

  // 建立 TCP 客户端连接 LabVIEW 模拟服务
  // 发送命令：建立发送命令的连接（50000）
  createLabVIEWClient(mainWindow, (_socket) => { socket = _socket; });
  // 启动监听 LabVIEW 数据推送
  connectToLabVIEWDataStream(mainWindow);

});

//监听前端 ipcMain.on('labview-send') → 把数据写到 socket 发给 LabVIEW（TCP）
ipcMain.on('labview-send', (event, msg) => {
  if (socket && !socket.destroyed) {
    console.log('[labview] Sending:', msg);
    socket.write(msg);
  } else {
    console.warn('[labview] socket not ready, cannot send:', msg);
  }
});

// 监听前端 ipcMain.on('labview-command') → 发送命令给 LabVIEW
ipcMain.on('labview-command', (event, { field, value }) => {
  sendLabVIEWCommand(field, value);
});

