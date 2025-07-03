const net = require('net');

// --------------------------
// 接收指令（Electron -> LabVIEW 模拟）
// --------------------------
const commandServer = net.createServer((socket) => {
  console.log('[LabVIEW模拟] Electron 已连接 50000');

  socket.on('data', (data) => {
    console.log('[LabVIEW模拟] 收到命令:', data.toString());
  });

  socket.on('end', () => {
    console.log('[LabVIEW模拟] Electron 已断开');
  });

  socket.on('error', (err) => {
    console.log('[LabVIEW模拟] socket 错误:', err);
  });
});

commandServer.listen(50000, () => {
  console.log('[LabVIEW模拟] 指令接收服务启动在端口 50000');
});

// --------------------------
// 推送数据（LabVIEW 模拟 -> Electron）
// --------------------------
const dataPushServer = net.createServer((socket) => {
  console.log('[LabVIEW模拟] Electron 开始监听 50001');

  // const interval = setInterval(() => {
  //   const mockData = {
  //     time: Date.now(),
  //     temperature: +(Math.random() * 10 + 20).toFixed(2),
  //     pressure: +(Math.random() * 0.5 + 1).toFixed(2)
  //   };
  //   socket.write(JSON.stringify(mockData) + '\n');
  // }, 50);
  // 发送的数据格式包一层
  const interval = setInterval(() => {
  const payload = {
    type: 'response',
    data: {
      time: Date.now(),
      temperature: +(Math.random() * 10 + 20).toFixed(2),
      pressure: +(Math.random() * 0.5 + 1).toFixed(2)
    }
  };
  socket.write(JSON.stringify(payload) + '\n');
}, 50);

  socket.on('end', () => {
    clearInterval(interval);
    console.log('[LabVIEW模拟] 断开连接');
  });

  socket.on('error', (err) => {
    console.log('[LabVIEW模拟] 数据推送 socket 错误:', err);
  });
});

dataPushServer.listen(50001, () => {
  console.log('[LabVIEW模拟] 数据推送服务启动在端口 50001');
});
