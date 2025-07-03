// Electron 主进程入口，负责创建窗口和连接 LabVIEW 模拟服务
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { createLabVIEWClient } = require('./labviewClient');

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
  createLabVIEWClient(mainWindow, (_socket) => { socket = _socket; });
});

//监听前端 ipcMain.on('labview-send') → 把数据写到 socket 发给 LabVIEW（TCP）
ipcMain.on('labview-send', (event, msg) => {
  socket.write(JSON.stringify(msg));
});
