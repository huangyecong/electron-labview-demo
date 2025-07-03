// TCP 客户端模块，连接 LabVIEW mock 服务，监听数据并发给前端
const net = require('net');

function createLabVIEWClient(win, callback) {
  //用 Node.js 的 net.Socket() 创建 TCP 客户端
  const socket = new net.Socket();
  
  // 连接到 127.0.0.1:5000
  socket.connect(5000, '127.0.0.1', () => console.log('[Electron] Connected to LabVIEW'));

  socket.on('data', data => {
    try {
      const json = JSON.parse(data.toString());
      // 接收到服务端返回的数据后，通过webContents.send，发消息给前端（渲染进程）
      win.webContents.send('labview-data', json);
    } catch {}
  });

  socket.on('error', err => console.error('[Electron] Socket error', err));
  callback(socket);
}

module.exports = { createLabVIEWClient };
