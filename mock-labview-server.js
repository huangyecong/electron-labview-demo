// Node.js TCP Server 模拟 LabVIEW 设备，支持命令响应、状态查询、主动通知
const net = require('net');

const server = net.createServer((socket) => {
  console.log('[LabVIEW] Electron connected');

  socket.on('data', (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      console.error('Invalid JSON from Electron');
      return;
    }

    // 命令处理：开始反应
    if (msg.type === 'command' && msg.action === 'start_reaction') {
      console.log('[LabVIEW] 开始模拟反应...');
      let i = 0;
      const timer = setInterval(() => {
        const resp = {
          type: 'response',
          data: {
            time: Date.now(),
            temperature: (25 + Math.random() * 5).toFixed(2),
            concentration: Math.random().toFixed(2)
          }
        };
        socket.write(JSON.stringify(resp));
        if (++i >= 10) clearInterval(timer);
      }, 1000);
    }

    // 查询设备状态
    if (msg.type === 'query' && msg.action === 'get_status') {
      const status = {
        type: 'response',
        data: { status: 'READY', timestamp: Date.now() }
      };
      socket.write(JSON.stringify(status));
    }
  });

  // 模拟设备主动推送通知
  setInterval(() => {
    const notify = {
      type: 'notify',
      event: 'DEVICE_IDLE',
      timestamp: Date.now()
    };
    socket.write(JSON.stringify(notify));
  }, 10000);
});

server.listen(5000, () => console.log('[LabVIEW] 模拟服务已启动，监听端口 5000'));
