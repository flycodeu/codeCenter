---
title: WebRtc推送视频流
createTime: 2025/10/22 11:05:04
permalink: /article/r698dizq/
tags:
   - 视频流
   - WebRTC
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/6f75f8e2b0df3e00dfd65ad98dfda1ed.jpg
---
# 使用 MediaMTX 搭建 WebRTC 实时视频流服务器（对接大华相机）

最近在做一个局域网实时视频监控的小项目，想通过浏览器直接播放大华相机的实时画面。原本打算自己搭建 RTMP/RTSP 服务，但折腾起来有点麻烦，还要处理转码、延迟等问题。后来发现一个非常好用的开源项目——**[MediaMTX](https://github.com/bluenviron/mediamtx)**（原 rtsp-simple-server），它不仅能轻松处理 RTSP 流，还内置 WebRTC 输出，非常方便。

这篇文章记录一下我用 MediaMTX 实现 WebRTC 推流、并搭配前端播放器的完整过程。

---

## 一、背景与原理

常见的视频流方案主要有以下几种：

| 协议   | 主要用途                        | 延迟   | 是否浏览器原生支持 |
| ------ | ------------------------------- | ------ | ------------------ |
| RTSP   | 摄像头、NVR、监控系统           | 0.5~2s | ❌                  |
| RTMP   | 推流到直播平台（如 OBS → B 站） | 1~3s   | ❌                  |
| HLS    | 点播/直播网页播放               | 5~30s  | ✅（通过 MSE）      |
| WebRTC | 实时音视频通信                  | <1s    | ✅                  |

大华、海康等摄像头一般通过 **RTSP** 提供原始码流。浏览器无法直接播放 RTSP，所以通常需要一个中间层来“转换协议”。  
MediaMTX 正好能完成这件事——它支持：

- RTSP、RTMP、HLS、WebRTC、SRT 等多种协议互转；
- 自动拉流、转发；
- 提供 Web 界面、API、Metrics 监控。

换句话说，MediaMTX 可以当作一个“万能的流媒体中转服务”。  
我们只要让它从相机拉 RTSP 流，再通过 WebRTC 输出，就能在网页中低延迟播放。

---

## 二、下载 MediaMTX

在 [GitHub Releases](https://github.com/bluenviron/mediamtx/releases/tag/v1.15.3) 页面下载对应系统的版本即可。  
下载后解压，会看到以下文件：

```
mediamtx.exe
mediamtx.yml
```

我们只需要修改 `mediamtx.yml` 配置文件，然后直接运行 `mediamtx.exe`。

---

## 三、修改配置文件

详细官方文档参考：[MediaMTX](https://mediamtx.org/docs/usage/read)

在 `mediamtx.yml` 中的 `paths` 段落添加相机的 RTSP 地址。例如：

```yaml
paths:
  cam_201_ch1:
    source: rtsp://账号:密码@192.168.1.201:554/cam/realmonitor?channel=1&subtype=0
    sourceProtocol: tcp
    sourceOnDemand: yes
```
说明：

- `cam_201_ch1` 是流的名字，后续 WebRTC 访问路径会用到；
- `source` 是相机的 RTSP URL；
- `sourceProtocol: tcp` 通常比 UDP 稳定；
- `sourceOnDemand: yes` 表示只有当有人访问时才去拉流（节省带宽）。

如果需要启动API接口，可以修改配置文件：改为true
```yaml
api: yes
apiAddress: :9997
```
官方接口文档参考：[MediaMTX](https://mediamtx.org/docs/references/control-api)

如果需要启动Metrics接口，可以修改配置文件：改为true
```yaml
metrics: yes
metricsAddress: :9998
```
官方监控接口文档参考：[MediaMTX](https://mediamtx.org/docs/usage/metrics)

保存文件后，就可以启动服务器了。

---

## 四、编写启动脚本

为了方便启动和提示信息，可以写一个简单的批处理脚本：

```bat
@echo off
chcp 65001 >nul
title MediaMTX - 大华相机WebRTC服务器

echo ========================================
echo    大华相机 WebRTC 流媒体服务器
echo ========================================
echo.

REM 检查 mediamtx.exe 是否存在
if not exist "mediamtx.exe" (
    echo [错误] 未找到 mediamtx.exe
    echo 请下载 MediaMTX 并解压到当前目录
    echo 下载地址: https://github.com/bluenviron/mediamtx/releases
    echo.
    pause
    exit /b 1
)

REM 检查配置文件
if not exist "mediamtx.yml" (
    echo [错误] 未找到配置文件 mediamtx_dahua.yml
    echo 请确保配置文件在当前目录下
    echo.
    pause
    exit /b 1
)

echo [信息] 正在启动 MediaMTX 服务器...
echo [信息] 配置文件: mediamtx_dahua.yml
echo.
echo ----------------------------------------
echo  服务地址:
echo ----------------------------------------
echo  WebRTC 播放器: http://localhost:8889
echo  API 接口:      http://localhost:9997
echo  Metrics 监控:  http://localhost:9998/metrics
echo  Web 前端:      打开 dahua_webrtc_viewer.html
echo ----------------------------------------
echo.
echo [提示] 按 Ctrl+C 停止服务器
echo.

REM 启动 MediaMTX
mediamtx.exe mediamtx.yml

echo.
echo [信息] MediaMTX 已停止
pause
```

执行后，MediaMTX 会在本地启动几个端口：

| 功能          | 地址                  |
| ------------- | --------------------- |
| WebRTC 播放器 | http://localhost:8889 |
| API 接口      | http://localhost:9997 |
| Metrics 监控  | http://localhost:9998 |

---

## 五、编写 Web 前端播放界面

WebRTC 端访问的路径格式如下：

```
http://localhost:8889/{path}/whep
```

比如前面定义的 `cam_201_ch1`，就对应：

```
http://localhost:8889/cam_201_ch1/whep
```

前端页面使用原生 WebRTC API 创建 `RTCPeerConnection`，通过 WHEP 协议和 MediaMTX 建立会话：

1. 创建 `RTCPeerConnection`；
2. 添加接收视频轨道；
3. `createOffer()` → 发送到 MediaMTX；
4. 获取 `answer` 并播放流。

完整示例可参考 HTML 代码。
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>大华相机 WebRTC 实时监控</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📹</text></svg>">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Microsoft YaHei', sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
            color: #fff;
            overflow-x: hidden;
        }

        header {
            padding: 20px 30px;
            background: rgba(22, 33, 62, 0.95);
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            position: sticky;
            top: 0;
            z-index: 100;
            border-bottom: 2px solid rgba(76, 175, 80, 0.3);
        }

        .header-content {
            max-width: 1920px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }

        h1 {
            font-size: 24px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        h1 .icon {
            font-size: 28px;
            animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.1);
            }
        }

        .stats {
            display: flex;
            gap: 20px;
            font-size: 14px;
            flex-wrap: wrap;
        }

        .stat-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 15px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-label {
            color: #888;
        }

        .stat-value {
            font-weight: bold;
            color: #4caf50;
            font-size: 16px;
        }

        .controls {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .btn-primary {
            background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(76, 175, 80, 0.6);
        }

        .btn-secondary {
            background: rgba(244, 67, 54, 0.8);
            color: white;
        }

        .btn-secondary:hover {
            background: rgba(244, 67, 54, 1);
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
            gap: 20px;
            padding: 30px;
            max-width: 1920px;
            margin: 0 auto;
        }

        .stream-card {
            background: rgba(26, 26, 26, 0.8);
            border-radius: 16px;
            overflow: hidden;
            border: 2px solid rgba(42, 42, 42, 0.8);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            backdrop-filter: blur(10px);
        }

        .stream-card:hover {
            border-color: #4caf50;
            transform: translateY(-5px);
            box-shadow: 0 12px 30px rgba(76, 175, 80, 0.4);
        }

        .video-wrapper {
            position: relative;
            background: #000;
            aspect-ratio: 16/9;
            overflow: hidden;
        }

        video {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
            background: #000;
        }

        .overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 15px;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
        }

        .stream-card.loading .overlay {
            opacity: 1;
            pointer-events: all;
        }

        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(76, 175, 80, 0.2);
            border-top-color: #4caf50;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        .loading-text {
            color: #888;
            font-size: 14px;
        }

        .error-message {
            color: #f44336;
            font-size: 14px;
            text-align: center;
            padding: 10px;
        }

        .info {
            padding: 16px;
            background: rgba(21, 21, 21, 0.9);
        }

        .stream-name {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 8px;
            color: #fff;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .stream-meta {
            display: flex;
            gap: 15px;
            margin-bottom: 10px;
            font-size: 13px;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 5px;
            color: #888;
        }

        .stream-status {
            font-size: 13px;
            color: #888;
            padding: 4px 10px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.05);
            display: inline-block;
        }

        .stream-status.live {
            color: #4caf50;
            background: rgba(76, 175, 80, 0.15);
        }

        .stream-status.error {
            color: #f44336;
            background: rgba(244, 67, 54, 0.15);
        }

        .card-controls {
            display: flex;
            gap: 8px;
            margin-top: 12px;
        }

        .card-controls .btn {
            flex: 1;
            justify-content: center;
            padding: 8px 12px;
            font-size: 13px;
        }

        .fullscreen-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 8px 12px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 10;
            font-size: 12px;
        }

        .stream-card:hover .fullscreen-btn {
            opacity: 1;
        }

        .fullscreen-btn:hover {
            background: rgba(0, 0, 0, 0.9);
        }

        @media (max-width: 1200px) {
            .grid {
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            }
        }

        @media (max-width: 768px) {
            .grid {
                grid-template-columns: 1fr;
                padding: 15px;
            }

            h1 {
                font-size: 20px;
            }

            .stats {
                width: 100%;
            }
        }

        /* 连接状态指示器 */
        .connection-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #888;
            display: inline-block;
            margin-right: 5px;
        }

        .connection-indicator.connected {
            background: #4caf50;
            box-shadow: 0 0 8px #4caf50;
        }

        .connection-indicator.connecting {
            background: #ff9800;
            animation: blink 1s infinite;
        }

        @keyframes blink {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.3;
            }
        }
    </style>
</head>
<body>

<header>
    <div class="header-content">
        <h1>
            <span class="icon">📹</span>
            大华相机 WebRTC 实时监控系统
        </h1>

        <div class="stats">
            <div class="stat-item">
                <span class="stat-label">总路数:</span>
                <span class="stat-value" id="totalCount">20</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">在线:</span>
                <span class="stat-value" id="onlineCount">0</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">延迟:</span>
                <span class="stat-value" style="color: #4caf50;">~1秒</span>
            </div>
        </div>

        <div class="controls">
            <button class="btn btn-primary" id="playAllBtn">
                ▶️ 全部播放
            </button>
            <button class="btn btn-secondary" id="stopAllBtn">
                ⏹️ 全部停止
            </button>
        </div>
    </div>
</header>

<div class="grid" id="grid"></div>

<script>
    // MediaMTX 服务器地址
    const MEDIAMTX_BASE = window.location.protocol + '//' + window.location.hostname + ':8889';

    // 摄像头配置
    const cameras = [
        {ip: 'xxxx', name: 'xxx'}
    ];

    // 生成流列表
    const streams = [];
    cameras.forEach(cam => {
        [1, 2].forEach(ch => {
            const ipLast = cam.ip.split('.').pop();
            streams.push({
                id: `cam_${ipLast}_ch${ch}`,
                name: `${cam.name} - 通道${ch}`,
                ip: cam.ip,
                channel: ch,
                path: `cam_${ipLast}_ch${ch}`
            });
        });
    });

    // WebRTC 播放器类
    class WebRTCPlayer {
        constructor(container, stream) {
            this.container = container;
            this.stream = stream;
            this.pc = null;
            this.video = container.querySelector('video');
            this.statusEl = container.querySelector('.stream-status');
            this.indicator = container.querySelector('.connection-indicator');
            this.retryCount = 0;
            this.maxRetries = 3;
            this.isPlaying = false;
        }

        async play() {
            try {
                this.container.classList.add('loading');
                this.statusEl.textContent = '连接中...';
                this.statusEl.classList.remove('live', 'error');
                this.indicator.className = 'connection-indicator connecting';

                // 创建 RTCPeerConnection
                this.pc = new RTCPeerConnection({
                    iceServers: [
                        {urls: 'stun:stun.l.google.com:19302'},
                        {urls: 'stun:stun1.l.google.com:19302'}
                    ]
                });

                // 监听接收的视频流
                this.pc.ontrack = async (event) => {
                    console.log('收到视频流:', this.stream.name);

                    // 设置视频流
                    this.video.srcObject = event.streams[0];

                    try {
                        await this.video.play();
                        console.log(`[${this.stream.name}] 视频开始播放`);
                        this.isPlaying = true;
                    } catch (playError) {
                        console.error(`[${this.stream.name}] 播放失败:`, playError);
                        // 如果自动播放失败，可能需要用户交互
                        this.statusEl.textContent = '需要点击播放';
                        this.statusEl.classList.add('error');
                        return;
                    }

                    this.container.classList.remove('loading');
                    this.statusEl.textContent = '直播中';
                    this.statusEl.classList.add('live');
                    this.indicator.className = 'connection-indicator connected';
                    this.retryCount = 0;
                    updateStats();
                };

                // 监听视频元素事件
                this.video.onloadedmetadata = () => {
                    console.log(`[${this.stream.name}] 视频元数据加载完成`);
                };

                this.video.oncanplay = () => {
                    console.log(`[${this.stream.name}] 视频可以播放`);
                };

                this.video.onerror = (e) => {
                    console.error(`[${this.stream.name}] 视频元素错误:`, e);
                };

                // ICE 连接状态变化
                this.pc.oniceconnectionstatechange = () => {
                    console.log(`[${this.stream.name}] ICE状态:`, this.pc.iceConnectionState);

                    if (this.pc.iceConnectionState === 'disconnected' ||
                        this.pc.iceConnectionState === 'failed') {
                        this.statusEl.textContent = '连接断开';
                        this.statusEl.classList.remove('live');
                        this.statusEl.classList.add('error');
                        this.indicator.className = 'connection-indicator';
                        this.isPlaying = false;

                        // 自动重连
                        if (this.retryCount < this.maxRetries) {
                            this.retryCount++;
                            console.log(`[${this.stream.name}] 尝试重连 ${this.retryCount}/${this.maxRetries}`);
                            setTimeout(() => this.restart(), 2000);
                        }
                    }
                };

                // 添加视频接收器
                this.pc.addTransceiver('video', {direction: 'recvonly'});
                this.pc.addTransceiver('audio', {direction: 'recvonly'});

                // 创建 Offer
                const offer = await this.pc.createOffer();
                await this.pc.setLocalDescription(offer);

                // 发送 Offer 到 MediaMTX (使用 WHEP 协议)
                const url = `${MEDIAMTX_BASE}/${this.stream.path}/whep`;
                console.log(`[${this.stream.name}] 连接到:`, url);

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/sdp'
                    },
                    body: offer.sdp
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                // 接收 Answer
                const answer = await response.text();
                await this.pc.setRemoteDescription({
                    type: 'answer',
                    sdp: answer
                });

                console.log(`[${this.stream.name}] WebRTC 连接建立成功`);

            } catch (error) {
                console.error(`[${this.stream.name}] 播放失败:`, error);
                this.container.classList.remove('loading');
                this.statusEl.textContent = `连接失败: ${error.message}`;
                this.statusEl.classList.add('error');
                this.indicator.className = 'connection-indicator';
                this.isPlaying = false;

                // 重试
                if (this.retryCount < this.maxRetries) {
                    this.retryCount++;
                    setTimeout(() => this.restart(), 3000);
                }
            }
        }

        stop() {
            if (this.pc) {
                this.pc.close();
                this.pc = null;
            }
            if (this.video.srcObject) {
                this.video.srcObject.getTracks().forEach(track => track.stop());
            }
            this.video.srcObject = null;
            this.video.pause();
            this.statusEl.textContent = '已停止';
            this.statusEl.classList.remove('live', 'error');
            this.indicator.className = 'connection-indicator';
            this.container.classList.remove('loading');
            this.retryCount = 0;
            this.isPlaying = false;
            updateStats();
        }

        async restart() {
            this.stop();
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.play();
        }

        toggleFullscreen() {
            if (!document.fullscreenElement) {
                this.video.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    }

    // 初始化界面
    const grid = document.getElementById('grid');
    const players = [];

    streams.forEach(stream => {
        const card = document.createElement('div');
        card.className = 'stream-card';
        // 添加autoplay, muted, playsinline 属性
        card.innerHTML = `
            <div class="video-wrapper">
                <video autoplay muted playsinline></video>
                <button class="fullscreen-btn" title="全屏">🔲 全屏</button>
                <div class="overlay">
                    <div class="spinner"></div>
                    <div class="loading-text">正在连接...</div>
                </div>
            </div>
            <div class="info">
                <div class="stream-name">
                    <span class="connection-indicator"></span>
                    ${stream.name}
                </div>
                <div class="stream-meta">
                    <div class="meta-item">📍 ${stream.ip}</div>
                    <div class="meta-item">📺 通道${stream.channel}</div>
                </div>
                <span class="stream-status">就绪</span>
                <div class="card-controls">
                    <button class="btn btn-primary btn-play">▶️ 播放</button>
                    <button class="btn btn-secondary btn-stop">⏹️ 停止</button>
                </div>
            </div>
        `;

        grid.appendChild(card);

        const player = new WebRTCPlayer(card, stream);
        players.push(player);

        // 按钮事件
        card.querySelector('.btn-play').addEventListener('click', () => player.play());
        card.querySelector('.btn-stop').addEventListener('click', () => player.stop());
        card.querySelector('.fullscreen-btn').addEventListener('click', () => player.toggleFullscreen());

        // 自动播放（延迟启动避免同时连接）
        setTimeout(() => player.play(), Math.random() * 3000);
    });

    // 全局控制
    document.getElementById('playAllBtn').addEventListener('click', () => {
        players.forEach((player, index) => {
            setTimeout(() => player.play(), index * 200);
        });
    });

    document.getElementById('stopAllBtn').addEventListener('click', () => {
        players.forEach(player => player.stop());
    });

    // 更新统计信息
    function updateStats() {
        let onlineCount = 0;
        players.forEach(player => {
            if (player.isPlaying && player.video.readyState >= 2) {
                onlineCount++;
            }
        });
        document.getElementById('onlineCount').textContent = onlineCount;
    }

    setInterval(updateStats, 2000);

    // 页面可见性变化处理
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            console.log('页面隐藏，暂停所有流');
            // 可选：暂停所有播放以节省资源
        } else {
            console.log('页面可见，恢复流');
        }
    });

    console.log('WebRTC 播放器初始化完成，共', streams.length, '路流');
</script>

</body>
</html>
```
---

## 六、效果展示

启动脚本后打开网页（例如 `index.html`），即可在浏览器中看到实时画面。  
WebRTC 延迟非常低，大约在 **500~1000ms** 左右，肉眼几乎无感。  
在局域网环境下，稳定性也非常好。

多路相机同时播放时，CPU 占用会略高，但整体还可以接受。如果需要更强的性能，可以考虑将 `sourceOnDemand` 打开，只在有人观看时才拉流。
![](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/20251022111822.png)
---

## 七、几点经验

1. **WebRTC 与 HLS 的区别**  
   WebRTC 延迟低，但要求实时连接、编解码压力较高。  
   HLS 延迟高，但适合直播分发。  
   如果你只需要网页端低延迟预览，WebRTC 是更好的选择。

2. **MediaMTX 的优势**
    - 零依赖、单文件运行；
    - 自动协议转换；
    - 提供 WebRTC / HLS / RTSP / RTMP 一体化输出；
    - 性能出色，稳定可靠。

3. **浏览器兼容性**  
   Chrome、Edge、Firefox 都支持 WebRTC。  
   Safari 也支持，但有时会触发自动播放限制，需要 `autoplay muted playsinline` 属性。

---

## 八、结语

总体体验下来，**MediaMTX + WebRTC 是一种非常轻量、优雅的实时视频方案**。  
不需要自己搭 RTMP 服务器，也不用折腾转码。  
对于要在浏览器中直接播放摄像头实时画面的场景（如监控、门禁、IoT 可视化等），非常值得使用。

后续我会再写一篇文章，介绍如何在公网环境下部署（NAT、TURN 服务器、HTTPS 等问题），让这个方案能安全地跑在互联网上。

---

**参考资料：**

- [MediaMTX 官方文档](https://mediamtx.org/)
- [WebRTC 协议说明（WHEP/WHEP）](https://www.ietf.org/archive/id/draft-murillo-whep-03.html)
- [大华相机 RTSP URL 规范](https://support.dahuatech.com/)