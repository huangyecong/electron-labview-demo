const net = require('net');

// --- 配置 ---
const HOST = '127.0.0.1';
const CONTROL_PORT = 50000;   // 接收 Electron 控制命令
const STREAM_PORT = 50001;    // 推送实时数据

// --- 模拟控制端：接收来自 Electron 的控制指令 ---
const controlServer = net.createServer((socket) => {
  console.log('[控制端] 已连接');

  socket.on('data', (data) => {
    const cmd = data.toString().trim();
    console.log(`[控制端] 收到指令: ${cmd}`);
    // 可以在这里加入指令逻辑模拟状态更新等
  });

  socket.on('end', () => {
    console.log('[控制端] 已断开连接');
  });

  socket.on('error', (err) => {
    console.error('[控制端] 错误:', err.message);
  });
});

controlServer.listen(CONTROL_PORT, HOST, () => {
  console.log(`[控制端] 监听 ${HOST}:${CONTROL_PORT}`);
});


// --- 模拟推送端：每 50ms 推送数据 ---
const streamServer = net.createServer((socket) => {
  console.log('[数据端] 已连接');

  const interval = setInterval(() => {
    const data = [
      `flow:${(Math.random() * 10).toFixed(2)}`,
      `weight:${(Math.random() * 100).toFixed(2)}`,
      `room_temperature:${(20 + Math.random() * 5).toFixed(2)}`,
      `pressure:${(1 + Math.random()).toFixed(2)}`,
      `reactor_temperature:${(50 + Math.random() * 10).toFixed(2)}`,
      `ph:${(7 + Math.random()).toFixed(2)}`,
      `input_temperature:${(25 + Math.random() * 5).toFixed(2)}`,
      `output_temperature:${(25 + Math.random() * 5).toFixed(2)}`
    ].join('\n') + '\n';

    socket.write(data);
  }, 50);

  socket.on('end', () => {
    console.log('[数据端] 客户端断开连接');
    clearInterval(interval);
  });

  socket.on('error', (err) => {
    console.error('[数据端] 错误:', err.message);
    clearInterval(interval);
  });
});

streamServer.listen(STREAM_PORT, HOST, () => {
  console.log(`[数据端] 监听 ${HOST}:${STREAM_PORT}`);
});
