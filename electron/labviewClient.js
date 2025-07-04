// 使用Node.js中的net模块实现的TCP客户端模块，专门用来和Labview 进行通信
const net = require('net') // 引入net模块

let commandSocket = null //保存与 LabVIEW 控制端口（50000）连接的 socket 实例，方便之后复用或发送命令。
const LABVIEW_HOST = '127.0.0.1' // 真实 LabVIEW IP

// 一、连接 LabVIEW 指令服务（端口50000）：用于发送控制命令
function createLabVIEWClient(window, callback) {
  const socket = net.connect(50000, LABVIEW_HOST, () => {
    // 连接成功之后
    console.log('[labview] Connected to LabVIEW control port (50000)')
    commandSocket = socket // 保存 socket 到 commandSocket
    if (callback) callback(socket) //如果有回调函数，则执行
  }) //建立 TCP 客户端连接。

  // 监听 socket 错误（比如 LabVIEW 没开）和断开事件。
  socket.on('error', (err) => {
    console.error('[labview] Control socket error:', err)
  })

  // 监听 socket 断开事件
  socket.on('end', () => {
    console.log('[labview] Control socket disconnected')
  })
}

// 发送命令给 LabVIEW
function sendLabVIEWCommand(field, value) {
  if (!commandSocket) {
    console.error('LabVIEW control socket not connected.')
    return
  } //确保 socket 已连接
  const cmd = `${field}:${value};` // 命令格式
  console.log('[labview] Sending command:', cmd)
  commandSocket.write(cmd) // 发送命令
}
// 二、连接 LabVIEW 数据推送服务（端口50001）：用于接收Labview实时推送的数据，如温度、压力等
function connectToLabVIEWDataStream(window) {
  // window：主窗口引用，用于通过 IPC 通知前端更新图表。
  const socket = net.connect(50001, LABVIEW_HOST, () => {
    console.log('[labview] Connected to LabVIEW 数据推送端口 (50001)')
  }) //建立TCP连接

  // 当 socket 接收到数据：
  socket.on('data', (data) => {
    if (socket.destroyed) {
      console.warn('[labview] socket destroyed, ignore data')
      return
    }
    try {
      console.log('[labview] Received from LabVIEW datadata:', data)
      // 将 buffer 转为字符串，按行 \n 分割
      const lines = data.toString().split('\n').filter(Boolean)

      // 遍历每一行
      const parsedData = {}
      lines.forEach((line) => {
        const [key, value] = line.split(':')
        if (key && value) {
          parsedData[key.trim()] = parseFloat(value.trim())
        }
      })

      console.log('[labview] ✅ 解析成功:', parsedData)
      // 发送给前端渲染
      window.webContents.send('labview-data', parsedData)
    } catch (error) {
      console.error('[labview] data parse error:', err)
    }
  })

  // 监听错误和断开连接的情况
  socket.on('error', (err) => console.error('[labview] socket error:', err))
  socket.on('end', () => console.log('[labview] 数据推送断开连接'))
}

// 导出接口:可以在 main.js 或 Electron 主进程中使用
module.exports = {
  createLabVIEWClient,
  sendLabVIEWCommand,
  connectToLabVIEWDataStream,
}
