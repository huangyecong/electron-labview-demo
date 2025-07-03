const net = require('net');

let commandSocket = null;
const LABVIEW_HOST = '127.0.0.1'; // 真实 LabVIEW IP


// 连接 LabVIEW 指令服务（50000）
function createLabVIEWClient(window, callback) {
  const socket = net.connect(50000, LABVIEW_HOST, () => {
    console.log('[labview] Connected to LabVIEW control port (50000)');
    commandSocket = socket;
    if (callback) callback(socket);
  });

  socket.on('error', (err) => {
    console.error('[labview] Control socket error:', err);
  });

  socket.on('end', () => {
    console.log('[labview] Control socket disconnected');
  });
}

// 连接 LabVIEW 数据推送服务（50001）
function connectToLabVIEWDataStream(window) {
  const socket = net.connect(50001, LABVIEW_HOST, () => {
    console.log('[labview] Connected to LabVIEW 数据推送端口 (50001)');
  });

  socket.on('data', (data) => {
    const lines = data.toString().split('\n').filter(Boolean);
    lines.forEach(line => {
      try {
        const parsed = JSON.parse(line);
        console.log('[labview] Received from LabVIEW:', parsed);
        window.webContents.send('labview-data', parsed);
      } catch (err) {
        console.error('[labview] JSON parse error', err);
      }
    });
  });

  socket.on('error', err => console.error('[labview] socket error:', err));
  socket.on('end', () => console.log('[labview] 数据推送断开连接'));
}

module.exports = {
  createLabVIEWClient,
  connectToLabVIEWDataStream
};
