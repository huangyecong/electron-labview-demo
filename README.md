# Electron 与 Labview 集成桌面应用

本项目基于 Electron + Vue 3 + ECharts，用于演示如何与 LabVIEW 通过 TCP 实现双向通信，实时接收实验数据并可视化展示。

## 一、🛠️ 运行方式

### 1.安装依赖：
```bash
npm install
```


### 2.启动模拟 LabVIEW 服务器：(可选，真实运行时请关闭)
```bash
node mock-labview-server.js
```

### 3.启动前端 + Electron：
```bash
npm run start
```

## 二、📬 联系与支持
如需接入真实 LabVIEW 或遇到串口、USB、仪器连接问题，请与 LabVIEW 工程师确认以下内容：

- 是否监听了 50001 端口
- 是否每 50ms 正常返回数据
- 是否开启了 TCP 功能/防火墙例外

## 三、🚀 项目结构说明
```bash
electron-labview-demo/
├── main.js              # Electron 主进程，负责窗口和通信初始化
├── labviewClient.js     # 与 LabVIEW 的 TCP 通信逻辑
├── preload.js           # 安全桥接前端与主进程的通信
├── mock-labview-server.js # （可选）用于调试的 LabVIEW 模拟服务器
├── src/
│   └── LabviewChart.vue # Vue 组件：实时显示多条曲线图
└── README.md            # 当前说明文档

```

## 四、🖥️ Electron 与 LabVIEW 通信架构
```css
          Electron 前端              Electron 主进程               LabVIEW
         ┌──────────────┐         ┌─────────────────┐        ┌──────────────┐
         │  LabviewChart │ ⇄ IPC ⇄│ main.js + preload │ ⇄ TCP ⇄│ LabVIEW VI/程序 │
         └──────────────┘         └─────────────────┘        └──────────────┘

```

## 五、🔁 通信流程

### 1. 发送命令（Electron → LabVIEW）
- 端口：127.0.0.1:50000
- 格式（必须以;结尾）：
```text
peristaltic_pump:1;
weight_zero:1;
stir_enable:1;
cyclic_temperature:1;

```
- 由 main.js 通过 sendLabVIEWCommand(field, value) 方法发送；
- 前端通过 window.labAPI.sendCommand(field, value) 调用。

### 2. 接收数据（LabVIEW → Electron）
- 端口：127.0.0.1:50001
- 返回频率：每 50ms 推送一次
- 数据格式（每行一项，以\n结尾，字符串格式）：
```makefile
pressure:1.72
reactor_temperature:50.65
ph:7.2
input_temperature:26.99
output_temperature:28.34
flow:0.00
weight:72.3
room_temperature:23.26

```
- Electron 主进程接收到字符串后，按行拆分并转为对象结构，通过 IPC 发送给前端；
- 前端监听 window.labAPI.onData(cb) 获取数据并更新图表。
  
## 六、📊 图表展示（前端）

使用 ECharts 实现 7 条实时折线图曲线展示：

- input_temperature
- output_temperature
- ph
- pressure
- reactor_temperature
- room_temperature
- weight

最多保留最近 50 个数据点，支持自动刷新。

## 七、🔧 开发调试辅助（可选）
### ✅ 模拟 LabVIEW
- 使用 mock-labview-server.js 启动调试用服务：
```bash
node mock-labview-server.js
```
- 接收来自 Electron 的指令（端口 50000）
- 每 50ms 模拟生成一次数据（端口 50001）

## 八、🛠️ 工具辅助：ncat 安装与使用（用于调试 LabVIEW 网络通信）
ncat 是 Nmap 官方提供的跨平台 TCP/UDP 通信调试工具，适用于模拟服务器或客户端，非常适合调试 LabVIEW 与 Electron 的网络通信是否畅通。


### ✅ 第一步：下载安装 Nmap（包含 ncat）
- 1. 打开官网下载页面：
👉 https://nmap.org/download.html

- 2. 找到 Microsoft Windows binaries 部分，点击下载链接，例如：
```bash
Latest stable release self-installer: nmap-<version>-setup.exe
```

- 3. 下载后运行安装程序，按提示一路“下一步”安装即可。

### ⚙️ 第二步（可选）：配置环境变量 PATH
安装后，ncat.exe 默认位于：

```java
C:\Program Files (x86)\Nmap\ncat.exe
```

为方便全局使用，可添加该路径至环境变量：

- 1. 按下 Win + S 搜索“环境变量”

- 2. 点击“编辑系统环境变量” → “环境变量”

- 3. 在“系统变量”区域找到并编辑 Path

- 4. 添加新条目：
```
C:\Program Files (x86)\Nmap
```
- 5.点击“确定”保存。

### 🧪 第三步：验证安装是否成功
打开 CMD 或 PowerShell 终端，输入：
```java
ncat -h
```
若看到帮助信息，则说明安装成功 ✅。

### 📡 第四步：监听 LabVIEW 数据推送端口（50001）
LabVIEW 会每 50ms 向 50001 端口推送实时数据。你可以用 ncat 来监听它：
```bash
ncat -l 50001
```
如果 LabVIEW 正常工作，你将在终端中看到一行一行的数据，例如：

```makefile
pressure:1.72
reactor_temperature:50.65
ph:7.2
...

```
### 📤 可选：向 LabVIEW 控制端口发送指令（50000）
使用 ncat 向 LabVIEW 控制端口发送控制命令（注意 ; 结尾）：
```bash
echo "peristaltic_pump:1;" | ncat 127.0.0.1 50000
```
你可以在 LabVIEW 控制台或模拟服务端查看是否收到该指令。

### 📋 常用命令速查表
```
### 📋 常用命令速查表

| 功能                          | 命令                                                                 |
|-------------------------------|----------------------------------------------------------------------|
| 启动监听，模拟 LabVIEW 服务端 | `ncat -l 50001`                                                     |
| 向 LabVIEW 控制端口发送指令   | `echo "peristaltic_pump:1;" \| ncat 127.0.0.1 50000`                 |
| 查看某端口是否被监听          | `netstat -ano | findstr :50001`                                     |
| 测试端口连通性（是否能连接）  | `ncat -vz 127.0.0.1 50000`                                          |

```
## 九、🧪 常见问题排查

```md

| 问题描述                         | 可能原因或解决方法                                       |
|----------------------------------|----------------------------------------------------------|
| 没有接收到数据                  | LabVIEW 未启动或未监听端口 50001；防火墙阻拦              |
| Electron 控制台显示 NaN         | 数据字段缺失、格式异常或 parseFloat 失败                 |
| 指令发送无响应                  | 指令格式错误（是否以 ; 结尾？）或 LabVIEW 端口未连接      |
| labview-data 收到 undefined     | LabVIEW 返回字符串格式错误或未按 key:value 换行发送       |
| 无法连接 LabVIEW                | LabVIEW 未启动/监听；IP 或端口配置错误；防火墙拦截       |

```