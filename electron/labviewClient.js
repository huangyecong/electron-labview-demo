// 使用Node.js中的net模块实现的TCP客户端模块，专门用来和Labview 进行通信
const net = require('net') // 引入net模块

let commandSocket = null // 保存与 LabVIEW 控制端口（50000）连接的 socket 实例，方便之后复用或发送命令。
const LABVIEW_HOST = '127.0.0.1' // 真实 LabVIEW IP

let reconnectTimer50000 = null // 控制端口重连定时器
let reconnectTimer50001 = null // 数据端口重连定时器

// 一、连接 LabVIEW 指令服务（端口50000）：用于发送控制命令
function createLabVIEWClient(window, callback) {
  function connectControlPort() {
    const socket = net.connect(50000, LABVIEW_HOST, () => {
      // 连接成功之后
      console.log('[labview] Connected to LabVIEW control port (50000)')
      commandSocket = socket // 保存 socket 到 commandSocket
      reconnectTimer50000 && clearTimeout(reconnectTimer50000) // 清除重连定时器
      if (callback) callback(socket) // 如果有回调函数，则执行
    })

    // 监听 socket 错误（比如 LabVIEW 没开）和断开事件。
    socket.on('error', (err) => {
      console.error('[labview] Control socket error:', err)
      scheduleReconnectControl()
    })

    socket.on('end', () => {
      console.log('[labview] Control socket disconnected')
      scheduleReconnectControl()
    })

    socket.on('close', () => {
      console.log('[labview] Control socket closed')
      scheduleReconnectControl()
    })
  }

  // 定时重连 每 3 秒尝试连接一次
  function scheduleReconnectControl() {
    if (reconnectTimer50000) return
    reconnectTimer50000 = setTimeout(() => {
      console.log('[labview] ⏳ Trying to reconnect control port...')
      connectControlPort()
    }, 3000)
  }

  connectControlPort()
}

// 发送命令给 LabVIEW
function sendLabVIEWCommand(field, value) {
  if (!commandSocket || commandSocket.destroyed) {
    console.error('LabVIEW control socket not connected.')
    return
  } // 确保 socket 已连接
  const cmd = `${field}:${value};` // 命令格式
  console.log('[labview] Sending command:', cmd)
  commandSocket.write(cmd) // 发送命令
}

// 二、连接 LabVIEW 数据推送服务（端口50001）：用于接收Labview实时推送的数据，如温度、压力等
function connectToLabVIEWDataStream(window) {
  function connectDataPort() {
    const socket = net.connect(50001, LABVIEW_HOST, () => {
      console.log('[labview] Connected to LabVIEW 数据推送端口 (50001)')
      reconnectTimer50001 && clearTimeout(reconnectTimer50001)
    })

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
      } catch (err) {
        console.error('[labview] data parse error:', err)
      }
    })

    // 监听错误和断开连接的情况
    socket.on('error', (err) => {
      console.error('[labview] socket error:', err)
      scheduleReconnectData()
    })

    socket.on('end', () => {
      console.log('[labview] 数据推送断开连接')
      scheduleReconnectData()
    })

    socket.on('close', () => {
      console.log('[labview] 数据推送socket关闭')
      scheduleReconnectData()
    })
  }

  // 定时重连
  function scheduleReconnectData() {
    if (reconnectTimer50001) return
    reconnectTimer50001 = setTimeout(() => {
      console.log('[labview] ⏳ Trying to reconnect 数据推送端口...')
      connectDataPort()
    }, 3000)
  }

  connectDataPort()
}

// 导出接口:可以在 main.js 或 Electron 主进程中使用
module.exports = {
  createLabVIEWClient,
  sendLabVIEWCommand,
  connectToLabVIEWDataStream,
}
